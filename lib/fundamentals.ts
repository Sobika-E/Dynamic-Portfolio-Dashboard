/**
 * Fundamental Data Service
 *
 * Fetches fundamental data (P/E ratio, earnings) from Yahoo Finance.
 * Uses the same yahoo-finance2 package as market data.
 *
 * IMPORTANT: Google Finance does not provide an official public API.
 * We use Yahoo Finance for fundamental data as it includes P/E and earnings.
 */

import yahooFinance from 'yahoo-finance2';
import { FundamentalData, FundamentalDataResponse, FundamentalDataError } from '../types/portfolio';

/**
 * Fetch fundamental data for a single symbol.
 */
export async function fetchFundamentalData(symbol: string): Promise<FundamentalData> {
  try {
    const result = await yahooFinance.quote(symbol);

    return {
      symbol,
      peRatio: result.peRatio || undefined,
      latestEarnings: result.epsTrailingTwelveMonths || undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching fundamental data for ${symbol}:`, error);
    throw new Error(`Failed to fetch fundamental data for ${symbol}`);
  }
}

/**
 * Fetch fundamental data for multiple symbols in batch.
 * Uses Promise.allSettled to handle partial failures gracefully.
 */
export async function fetchFundamentalDataBatch(
  symbols: string[]
): Promise<FundamentalDataResponse> {
  const data: FundamentalData[] = [];
  const errors: FundamentalDataError[] = [];

  // Use Promise.allSettled to handle partial failures
  const results = await Promise.allSettled(
    symbols.map(symbol => fetchFundamentalData(symbol))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      data.push(result.value);
    } else {
      errors.push({
        symbol: symbols[index],
        error: result.reason?.message || 'Unknown error',
      });
    }
  });

  return {
    data,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch fundamental data with retry logic for transient errors.
 */
export async function fetchFundamentalDataWithRetry(
  symbols: string[],
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<FundamentalDataResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFundamentalDataBatch(symbols);

      // If we got at least some successful data, return it
      if (response.data.length > 0) {
        return response;
      }

      // If all failed, retry
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed for all symbols. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed
  return {
    data: [],
    errors: symbols.map(symbol => ({
      symbol,
      error: lastError?.message || 'Max retries exceeded',
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock fundamental data for development/testing.
 * Returns deterministic mock data based on symbol.
 */
export function mockFundamentalData(symbols: string[]): FundamentalDataResponse {
  const data: FundamentalData[] = symbols.map(symbol => {
    // Generate deterministic mock P/E and earnings based on symbol hash
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const peRatio = 10 + (hash % 40); // P/E between 10 and 50
    const earnings = 10 + (hash % 100); // Earnings between 10 and 110

    return {
      symbol,
      peRatio,
      latestEarnings: earnings,
      timestamp: new Date().toISOString(),
    };
  });

  return {
    data,
    errors: [],
    timestamp: new Date().toISOString(),
  };
}
