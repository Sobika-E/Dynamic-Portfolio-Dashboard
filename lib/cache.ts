/**
 * In-Memory Cache Service
 *
 * Simple in-memory cache for market and fundamental data.
 * Reduces external API calls and improves performance.
 */

import { MarketQuote, FundamentalData, CachedMarketData, CachedFundamentalData } from '../types/portfolio';

// ============================================================================
// MARKET DATA CACHE
// ============================================================================

class MarketDataCache {
  private cache: Map<string, MarketQuote> = new Map();
  private lastUpdated: number = 0;
  private ttl: number = 60000; // 60 seconds default TTL

  constructor(ttl?: number) {
    if (ttl) this.ttl = ttl;
  }

  /**
   * Check if cache is valid (not expired).
   */
  isValid(): boolean {
    const now = Date.now();
    return now - this.lastUpdated < this.ttl;
  }

  /**
   * Get a single quote from cache.
   */
  get(symbol: string): MarketQuote | undefined {
    return this.cache.get(symbol);
  }

  /**
   * Get all quotes from cache.
   */
  getAll(): MarketQuote[] {
    return Array.from(this.cache.values());
  }

  /**
   * Set a single quote in cache.
   */
  set(quote: MarketQuote): void {
    this.cache.set(quote.symbol, quote);
    this.lastUpdated = Date.now();
  }

  /**
   * Set multiple quotes in cache.
   */
  setMany(quotes: MarketQuote[]): void {
    quotes.forEach(quote => this.set(quote));
  }

  /**
   * Clear the cache.
   */
  clear(): void {
    this.cache.clear();
    this.lastUpdated = 0;
  }

  /**
   * Get cache statistics.
   */
  getStats(): { size: number; lastUpdated: number; ttl: number; isValid: boolean } {
    return {
      size: this.cache.size,
      lastUpdated: this.lastUpdated,
      ttl: this.ttl,
      isValid: this.isValid(),
    };
  }
}

// ============================================================================
// FUNDAMENTAL DATA CACHE
// ============================================================================

class FundamentalDataCache {
  private cache: Map<string, FundamentalData> = new Map();
  private lastUpdated: number = 0;
  private ttl: number = 300000; // 5 minutes default TTL (fundamentals change less frequently)

  constructor(ttl?: number) {
    if (ttl) this.ttl = ttl;
  }

  /**
   * Check if cache is valid (not expired).
   */
  isValid(): boolean {
    const now = Date.now();
    return now - this.lastUpdated < this.ttl;
  }

  /**
   * Get a single fundamental data from cache.
   */
  get(symbol: string): FundamentalData | undefined {
    return this.cache.get(symbol);
  }

  /**
   * Get all fundamental data from cache.
   */
  getAll(): FundamentalData[] {
    return Array.from(this.cache.values());
  }

  /**
   * Set a single fundamental data in cache.
   */
  set(data: FundamentalData): void {
    this.cache.set(data.symbol, data);
    this.lastUpdated = Date.now();
  }

  /**
   * Set multiple fundamental data in cache.
   */
  setMany(data: FundamentalData[]): void {
    data.forEach(d => this.set(d));
  }

  /**
   * Clear the cache.
   */
  clear(): void {
    this.cache.clear();
    this.lastUpdated = 0;
  }

  /**
   * Get cache statistics.
   */
  getStats(): { size: number; lastUpdated: number; ttl: number; isValid: boolean } {
    return {
      size: this.cache.size,
      lastUpdated: this.lastUpdated,
      ttl: this.ttl,
      isValid: this.isValid(),
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCES
// ============================================================================

// Export singleton instances for use across the application
export const marketDataCache = new MarketDataCache(
  Number(process.env.CACHE_TTL_MARKET) || 60000
);

export const fundamentalDataCache = new FundamentalDataCache(
  Number(process.env.CACHE_TTL_FUNDAMENTAL) || 300000
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get cache TTL from environment variables.
 */
export function getCacheTTL(type: 'market' | 'fundamental'): number {
  if (type === 'market') {
    return Number(process.env.CACHE_TTL_MARKET) || 60000;
  }
  return Number(process.env.CACHE_TTL_FUNDAMENTAL) || 300000;
}

/**
 * Format cache age for display.
 */
export function formatCacheAge(lastUpdated: number): string {
  const now = Date.now();
  const ageMs = now - lastUpdated;
  const ageSeconds = Math.floor(ageMs / 1000);

  if (ageSeconds < 60) {
    return `${ageSeconds}s ago`;
  } else if (ageSeconds < 3600) {
    const minutes = Math.floor(ageSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(ageSeconds / 3600);
    return `${hours}h ago`;
  }
}
