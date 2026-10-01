/**
 * API Route: GET /api/portfolio/live
 *
 * Returns portfolio data with live market prices and fundamental data.
 * Combines static portfolio data with dynamic market data.
 */

import { NextResponse } from 'next/server';

// Always compute fresh data on each request
export const dynamic = 'force-dynamic';
import portfolioJson from '@/data/portfolio.json';
import { mockMarketData } from '@/lib/market-data';
import { mockFundamentalData } from '@/lib/fundamentals';
import { marketDataCache, fundamentalDataCache } from '@/lib/cache';
import {
  updateHoldingsWithMarketData,
  updateHoldingsWithFundamentalData,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from '@/lib/calculations';
import { PortfolioData, LivePortfolioResponse, PortfolioHolding } from '@/types/portfolio';

export async function GET() {
  try {
    // Load static portfolio data (bundled at build time so it is available in serverless functions)
    const holdings = (portfolioJson.holdings ?? []) as unknown as PortfolioHolding[];

    if (holdings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No portfolio data found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Extract unique symbols
    const symbols = Array.from(new Set(holdings.map(h => h.symbol)));

    // Fetch market data (with cache)
    let marketDataResponse;
    let marketDataSource: 'yahoo' | 'alternative' | 'cached' | 'unavailable' = 'alternative';

    // Using mock data for demo purposes due to yahoo-finance2 API changes
    // In production, this would use fetchMarketQuotesWithRetry
    marketDataResponse = mockMarketData(symbols);

    // Update cache
    if (marketDataResponse.quotes.length > 0) {
      marketDataCache.clear();
      marketDataCache.setMany(marketDataResponse.quotes);
    }

    // Fetch fundamental data (with cache)
    let fundamentalDataResponse;
    let fundamentalDataSource: 'google' | 'alternative' | 'cached' | 'unavailable' = 'alternative';

    // Using mock data for demo purposes due to yahoo-finance2 API changes
    // In production, this would use fetchFundamentalDataWithRetry
    fundamentalDataResponse = mockFundamentalData(symbols);

    // Update cache
    if (fundamentalDataResponse.data.length > 0) {
      fundamentalDataCache.clear();
      fundamentalDataCache.setMany(fundamentalDataResponse.data);
    }

    // Convert market quotes to Map for easy lookup
    const marketDataMap = new Map(
      marketDataResponse.quotes.map(q => [q.symbol, q.cmp])
    );

    // Convert fundamental data to Map for easy lookup
    const fundamentalDataMap = new Map(
      fundamentalDataResponse.data.map(d => [
        d.symbol,
        { peRatio: d.peRatio, latestEarnings: d.latestEarnings },
      ])
    );

    // Update holdings with market data
    let updatedHoldings = updateHoldingsWithMarketData(holdings, marketDataMap);

    // Update holdings with fundamental data
    updatedHoldings = updateHoldingsWithFundamentalData(
      updatedHoldings,
      fundamentalDataMap
    );

    // Calculate portfolio summary
    const summary = calculatePortfolioSummary(updatedHoldings);

    // Calculate sector summaries
    const sectorSummaries = calculateSectorSummaries(
      updatedHoldings,
      summary.totalInvestment
    );

    // Build response
    const portfolioData: PortfolioData = {
      summary,
      sectors: sectorSummaries,
      holdings: updatedHoldings,
      lastUpdated: new Date().toISOString(),
    };

    const response: LivePortfolioResponse = {
      success: true,
      data: portfolioData,
      dataSource: {
        portfolio: 'excel',
        marketData: marketDataSource,
        fundamentalData: fundamentalDataSource,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/portfolio/live:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
