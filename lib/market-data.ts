/**
 * Market Data Service
 *
 * Fetches current market prices (CMP) from Yahoo Finance.
 * Uses yahoo-finance2 package (unofficial but widely used).
 *
 * IMPORTANT: Yahoo Finance does not provide an official public API.
 * This implementation uses an unofficial library that may break without notice.
 * In production, consider using a paid API with official support.
 */

import yahooFinance from 'yahoo-finance2';
import { MarketQuote, MarketDataResponse, MarketDataError } from '../types/portfolio';

/**
 * Fetch current market price for a single symbol.
 */
export async function fetchMarketQuote(symbol: string): Promise<MarketQuote> {
  try {
    const result = await yahooFinance.quote(symbol);
    return {
      symbol,
      cmp: result.regularMarketPrice || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    throw new Error(`Failed to fetch market data for ${symbol}`);
  }
}

/**
 * Fetch market quotes for multiple symbols in batch.
 * Uses Promise.allSettled to handle partial failures gracefully.
 */
export async function fetchMarketQuotes(symbols: string[]): Promise<MarketDataResponse> {
  const quotes: MarketQuote[] = [];
  const errors: MarketDataError[] = [];

  // Use Promise.allSettled to handle partial failures
  const results = await Promise.allSettled(
    symbols.map(symbol => fetchMarketQuote(symbol))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      quotes.push(result.value);
    } else {
      errors.push({
        symbol: symbols[index],
        error: result.reason?.message || 'Unknown error',
      });
    }
  });

  return {
    quotes,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch market quotes with retry logic for transient errors.
 */
export async function fetchMarketQuotesWithRetry(
  symbols: string[],
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<MarketDataResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchMarketQuotes(symbols);

      // If we got at least some successful quotes, return it
      if (response.quotes.length > 0) {
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
    quotes: [],
    errors: symbols.map(symbol => ({
      symbol,
      error: lastError?.message || 'Max retries exceeded',
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock market data for development/testing.
 * Returns deterministic mock data based on symbol.
 */
export function mockMarketData(symbols: string[]): MarketDataResponse {
  const quotes: MarketQuote[] = symbols.map(symbol => {
    // Generate a deterministic mock price based on symbol hash
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 1000 + (hash % 2000);
    const variance = (hash % 100) / 100; // Small variance

    return {
      symbol,
      cmp: parseFloat((basePrice * (1 + variance)).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  });

  return {
    quotes,
    errors: [],
    timestamp: new Date().toISOString(),
  };
}
