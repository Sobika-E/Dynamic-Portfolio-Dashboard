/**
 * Financial Calculation Utilities
 *
 * This file contains all financial calculations for the portfolio dashboard.
 * Keeping calculations separate from UI components makes the code:
 * - More testable
 * - Easier to debug
 * - Reusable across different parts of the application
 */

import { PortfolioHolding, SectorSummary, PortfolioSummary } from '../types/portfolio';

// ============================================================================
// INDIVIDUAL STOCK CALCULATIONS
// ============================================================================

/**
 * Calculate investment for a stock.
 * Investment = Purchase Price × Quantity
 *
 * @param purchasePrice - Price at which stock was purchased
 * @param quantity - Number of shares
 * @returns Investment amount
 */
export function calculateInvestment(purchasePrice: number, quantity: number): number {
  return purchasePrice * quantity;
}

/**
 * Calculate present value for a stock.
 * Present Value = CMP × Quantity
 *
 * @param cmp - Current Market Price
 * @param quantity - Number of shares
 * @returns Present value
 */
export function calculatePresentValue(cmp: number, quantity: number): number {
  return cmp * quantity;
}

/**
 * Calculate gain/loss for a stock.
 * Gain/Loss = Present Value - Investment
 *
 * @param presentValue - Current present value
 * @param investment - Original investment
 * @returns Gain or loss amount (positive = gain, negative = loss)
 */
export function calculateGainLoss(presentValue: number, investment: number): number {
  return presentValue - investment;
}

/**
 * Calculate gain/loss percentage for a stock.
 * Gain/Loss % = ((Present Value - Investment) / Investment) × 100
 *
 * @param gainLoss - Gain or loss amount
 * @param investment - Original investment
 * @returns Gain/loss as percentage
 */
export function calculateGainLossPercent(gainLoss: number, investment: number): number {
  if (investment === 0) return 0;
  return (gainLoss / investment) * 100;
}

/**
 * Calculate portfolio weight (percentage) for a stock.
 * Portfolio % = (Stock Investment / Total Portfolio Investment) × 100
 *
 * @param stockInvestment - Investment in this stock
 * @param totalInvestment - Total portfolio investment
 * @returns Portfolio weight as percentage
 */
export function calculatePortfolioPercent(stockInvestment: number, totalInvestment: number): number {
  if (totalInvestment === 0) return 0;
  return (stockInvestment / totalInvestment) * 100;
}

/**
 * Calculate all dynamic metrics for a holding.
 * This is a convenience function that updates a holding with all calculated values.
 *
 * @param holding - Portfolio holding with static data
 * @param cmp - Current Market Price (optional, if not provided, calculations are skipped)
 * @returns Updated holding with calculated values
 */
export function calculateHoldingMetrics(
  holding: PortfolioHolding,
  cmp?: number
): PortfolioHolding {
  const updated = { ...holding };

  // Calculate investment (should already be set, but recalculate for consistency)
  updated.investment = calculateInvestment(holding.purchasePrice, holding.quantity);

  // If CMP is provided, calculate dynamic metrics
  if (cmp !== undefined && cmp !== null) {
    updated.cmp = cmp;
    updated.presentValue = calculatePresentValue(cmp, holding.quantity);
    updated.gainLoss = calculateGainLoss(updated.presentValue, updated.investment);
    updated.gainLossPercent = calculateGainLossPercent(updated.gainLoss, updated.investment);
  }

  return updated;
}

// ============================================================================
// SECTOR CALCULATIONS
// ============================================================================

/**
 * Calculate sector summary from a list of holdings.
 *
 * @param sectorName - Name of the sector
 * @param holdings - Holdings belonging to this sector
 * @param totalInvestment - Total portfolio investment (for portfolio % calculation)
 * @returns Sector summary with calculated metrics
 */
export function calculateSectorSummary(
  sectorName: string,
  holdings: PortfolioHolding[],
  totalInvestment: number
): SectorSummary {
  const sectorInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
  const sectorPresentValue = holdings.reduce((sum, h) => sum + (h.presentValue || h.investment), 0);
  const sectorGainLoss = sectorPresentValue - sectorInvestment;
  const sectorGainLossPercent = calculateGainLossPercent(sectorGainLoss, sectorInvestment);
  const portfolioPercent = calculatePortfolioPercent(sectorInvestment, totalInvestment);

  return {
    sector: sectorName,
    investment: sectorInvestment,
    presentValue: sectorPresentValue,
    gainLoss: sectorGainLoss,
    gainLossPercent: sectorGainLossPercent,
    stockCount: holdings.length,
    portfolioPercent,
  };
}

/**
 * Group holdings by sector and calculate sector summaries.
 *
 * @param holdings - All portfolio holdings
 * @param totalInvestment - Total portfolio investment
 * @returns Array of sector summaries
 */
export function calculateSectorSummaries(
  holdings: PortfolioHolding[],
  totalInvestment: number
): SectorSummary[] {
  // Group holdings by sector
  const sectorMap = new Map<string, PortfolioHolding[]>();
  holdings.forEach(holding => {
    const sector = holding.sector;
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(holding);
  });

  // Calculate summary for each sector
  const summaries: SectorSummary[] = [];
  sectorMap.forEach((sectorHoldings, sectorName) => {
    const summary = calculateSectorSummary(sectorName, sectorHoldings, totalInvestment);
    summaries.push(summary);
  });

  return summaries;
}

// ============================================================================
// PORTFOLIO CALCULATIONS
// ============================================================================

/**
 * Calculate overall portfolio summary.
 *
 * @param holdings - All portfolio holdings
 * @returns Portfolio summary with calculated metrics
 */
export function calculatePortfolioSummary(holdings: PortfolioHolding[]): PortfolioSummary {
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
  const totalPresentValue = holdings.reduce((sum, h) => sum + (h.presentValue || h.investment), 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const overallReturn = calculateGainLossPercent(totalGainLoss, totalInvestment);

  const uniqueSectors = new Set(holdings.map(h => h.sector));

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    overallReturn,
    stockCount: holdings.length,
    sectorCount: uniqueSectors.size,
  };
}

/**
 * Update all holdings with market data and recalculate metrics.
 *
 * @param holdings - Holdings with static data
 * @param marketData - Map of symbol to CMP
 * @returns Updated holdings with calculated dynamic metrics
 */
export function updateHoldingsWithMarketData(
  holdings: PortfolioHolding[],
  marketData: Map<string, number>
): PortfolioHolding[] {
  return holdings.map(holding => {
    const cmp = marketData.get(holding.symbol);
    return calculateHoldingMetrics(holding, cmp);
  });
}

/**
 * Update holdings with fundamental data (P/E, Earnings).
 *
 * @param holdings - Holdings with existing data
 * @param fundamentalData - Map of symbol to fundamental data
 * @returns Updated holdings with fundamental data
 */
export function updateHoldingsWithFundamentalData(
  holdings: PortfolioHolding[],
  fundamentalData: Map<string, { peRatio?: number; latestEarnings?: number }>
): PortfolioHolding[] {
  return holdings.map(holding => {
    const data = fundamentalData.get(holding.symbol);
    if (data) {
      return {
        ...holding,
        peRatio: data.peRatio,
        latestEarnings: data.latestEarnings,
      };
    }
    return holding;
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display.
 *
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage for display.
 *
 * @param value - Percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Determine if a value represents a gain (positive) or loss (negative).
 *
 * @param value - Numeric value
 * @returns 'gain' | 'loss' | 'neutral'
 */
export function getGainLossStatus(value: number): 'gain' | 'loss' | 'neutral' {
  if (value > 0) return 'gain';
  if (value < 0) return 'loss';
  return 'neutral';
}

/**
 * Get color class for gain/loss status.
 *
 * @param value - Numeric value
 * @returns Tailwind CSS color class
 */
export function getGainLossColor(value: number): string {
  const status = getGainLossStatus(value);
  switch (status) {
    case 'gain':
      return 'text-green-600';
    case 'loss':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get sign symbol for gain/loss.
 *
 * @param value - Numeric value
 * @returns '+' | '-' | ''
 */
export function getGainLossSign(value: number): string {
  const status = getGainLossStatus(value);
  switch (status) {
    case 'gain':
      return '+';
    case 'loss':
      return '-';
    default:
      return '';
  }
}
