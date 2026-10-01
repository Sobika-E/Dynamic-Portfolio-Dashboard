/**
 * Core Portfolio Types
 *
 * This file defines all TypeScript interfaces for the portfolio dashboard.
 * Strong typing helps catch errors early and makes the code more maintainable.
 */

// ============================================================================
// STOCK HOLDING TYPES
// ============================================================================

/**
 * Represents a single stock holding in the portfolio.
 *
 * Static fields (from Excel):
 * - id, sector, name, symbol, purchasePrice, quantity
 *
 * Dynamic fields (fetched from market APIs):
 * - cmp, peRatio, latestEarnings
 *
 * Calculated fields (computed by our system):
 * - investment, portfolioPercent, presentValue, gainLoss, gainLossPercent
 */
export interface PortfolioHolding {
  // Static identification fields
  id: string;              // Unique identifier (e.g., "hdfc-bank")
  sector: string;          // Sector name (e.g., "Financial Sector")
  name: string;            // Stock name (e.g., "HDFC Bank")
  symbol: string;          // Trading symbol (e.g., "HDFCBANK.NS")

  // Static portfolio data (from Excel)
  purchasePrice: number;   // Price at which stock was purchased
  quantity: number;        // Number of shares held

  // Calculated portfolio metrics
  investment: number;      // Purchase Price × Quantity
  portfolioPercent: number; // (Stock Investment / Total Investment) × 100

  // Dynamic market data (fetched from external APIs)
  cmp?: number;            // Current Market Price
  peRatio?: number;        // P/E Ratio (TTM)
  latestEarnings?: number; // Latest Earnings Per Share

  // Calculated dynamic metrics
  presentValue?: number;   // CMP × Quantity
  gainLoss?: number;       // Present Value - Investment
  gainLossPercent?: number; // (Gain/Loss / Investment) × 100
}

/**
 * Raw stock data as read from Excel file.
 * This is the intermediate format before normalization.
 */
export interface RawStockData {
  row: number;
  no: number | string;
  name: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercent: number;
  symbol: string | number;
  cmp?: number;
  presentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  marketCap?: number | string;
  peTTM?: number | string;
  latestEarnings?: number | string;
  sector: string;
}

// ============================================================================
// SECTOR TYPES
// ============================================================================

/**
 * Summary statistics for a sector.
 * Aggregated from all stocks belonging to that sector.
 */
export interface SectorSummary {
  sector: string;              // Sector name
  investment: number;          // Sum of all stock investments in sector
  presentValue: number;        // Sum of all stock present values in sector
  gainLoss: number;            // Sector Present Value - Sector Investment
  gainLossPercent: number;    // (Sector Gain/Loss / Sector Investment) × 100
  stockCount: number;         // Number of stocks in this sector
  portfolioPercent: number;    // (Sector Investment / Total Investment) × 100
}

/**
 * Sector with its associated holdings.
 * Used for grouped display in the UI.
 */
export interface SectorGroup {
  sector: string;
  summary: SectorSummary;
  holdings: PortfolioHolding[];
  isExpanded?: boolean;        // UI state for expand/collapse
}

// ============================================================================
// PORTFOLIO SUMMARY TYPES
// ============================================================================

/**
 * Overall portfolio summary statistics.
 * Calculated from all holdings across all sectors.
 */
export interface PortfolioSummary {
  totalInvestment: number;      // Sum of all stock investments
  totalPresentValue: number;    // Sum of all stock present values
  totalGainLoss: number;        // Total Present Value - Total Investment
  overallReturn: number;        // (Total Gain/Loss / Total Investment) × 100
  stockCount: number;           // Total number of stocks
  sectorCount: number;          // Total number of sectors
}

/**
 * Complete portfolio data including summary, sectors, and holdings.
 * This is the main data structure returned by the API.
 */
export interface PortfolioData {
  summary: PortfolioSummary;
  sectors: SectorSummary[];
  holdings: PortfolioHolding[];
  lastUpdated: string;          // ISO timestamp of last data update
}

// ============================================================================
// MARKET DATA TYPES
// ============================================================================

/**
 * Current market price data for a stock.
 * Fetched from Yahoo Finance or alternative provider.
 */
export interface MarketQuote {
  symbol: string;              // Stock symbol
  cmp: number;                 // Current Market Price
  timestamp: string;           // ISO timestamp when data was fetched
}

/**
 * Request for batch market data.
 */
export interface MarketDataRequest {
  symbols: string[];           // Array of symbols to fetch
}

/**
 * Response from market data API.
 * Includes both successful and failed quotes.
 */
export interface MarketDataResponse {
  quotes: MarketQuote[];       // Successfully fetched quotes
  errors: MarketDataError[];   // Failed symbol fetches
  timestamp: string;           // When the batch was fetched
}

/**
 * Error information for a failed market data fetch.
 */
export interface MarketDataError {
  symbol: string;              // Symbol that failed
  error: string;               // Error message
}

// ============================================================================
// FUNDAMENTAL DATA TYPES
// ============================================================================

/**
 * Fundamental data for a stock (P/E, Earnings).
 * Fetched from Google Finance or alternative provider.
 */
export interface FundamentalData {
  symbol: string;              // Stock symbol
  peRatio?: number;            // P/E Ratio (TTM)
  latestEarnings?: number;     // Latest Earnings Per Share
  timestamp: string;           // ISO timestamp when data was fetched
}

/**
 * Response from fundamental data API.
 */
export interface FundamentalDataResponse {
  data: FundamentalData[];     // Successfully fetched fundamental data
  errors: FundamentalDataError[]; // Failed fetches
  timestamp: string;           // When the batch was fetched
}

/**
 * Error information for a failed fundamental data fetch.
 */
export interface FundamentalDataError {
  symbol: string;              // Symbol that failed
  error: string;               // Error message
}

// ============================================================================
// CACHE TYPES
// ============================================================================

/**
 * Cached market data entry.
 */
export interface CachedMarketData {
  quotes: Map<string, MarketQuote>; // Symbol → MarketQuote
  timestamp: number;                 // Unix timestamp in milliseconds
  ttl: number;                       // Time-to-live in milliseconds
}

/**
 * Cached fundamental data entry.
 */
export interface CachedFundamentalData {
  data: Map<string, FundamentalData>; // Symbol → FundamentalData
  timestamp: number;                   // Unix timestamp in milliseconds
  ttl: number;                         // Time-to-live in milliseconds
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Live portfolio API response.
 * Combines static portfolio data with dynamic market data.
 */
export interface LivePortfolioResponse extends ApiResponse<PortfolioData> {
  data?: PortfolioData;
  dataSource: {
    portfolio: 'excel';         // Source of static portfolio data
    marketData: 'yahoo' | 'alternative' | 'cached' | 'unavailable';
    fundamentalData: 'google' | 'alternative' | 'cached' | 'unavailable';
  };
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Dashboard UI state.
 */
export interface DashboardState {
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  error: string | null;
  expandedSectors: Set<string>; // Set of expanded sector names
}

/**
 * Sort options for the portfolio table.
 */
export type SortField =
  | 'name'
  | 'purchasePrice'
  | 'quantity'
  | 'investment'
  | 'portfolioPercent'
  | 'cmp'
  | 'presentValue'
  | 'gainLoss'
  | 'gainLossPercent'
  | 'peRatio';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

// ============================================================================
// SYMBOL MAPPING TYPES
// ============================================================================

/**
 * Symbol mapping entry.
 * Maps Excel symbols to external API compatible symbols.
 */
export interface SymbolMapping {
  excelSymbol: string;        // Symbol as it appears in Excel
  normalizedSymbol: string;   // Symbol compatible with external APIs
  exchange: 'NSE' | 'BSE';     // Exchange
}

/**
 * Symbol mapping registry.
 */
export interface SymbolMappingRegistry {
  mappings: Map<string, SymbolMapping>;
  fallbackStrategy: 'append-suffix' | 'lookup-table' | 'skip';
}
