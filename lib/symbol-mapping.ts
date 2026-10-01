/**
 * Symbol Mapping Configuration
 *
 * This file handles the conversion of Excel symbols to external API-compatible formats.
 *
 * Problem: The Excel file has mixed symbol formats:
 * - Text symbols: HDFCBANK, BAJFINANCE, DMART (NSE symbols)
 * - Numeric symbols: 532174, 544252 (BSE codes)
 *
 * Solution: Map all symbols to a consistent format for external APIs.
 */

import { SymbolMapping, SymbolMappingRegistry } from '../types/portfolio';

/**
 * Known symbol mappings from Excel to external API format.
 *
 * For this project, we'll use Yahoo Finance format:
 * - NSE symbols: Add .NS suffix (e.g., HDFCBANK → HDFCBANK.NS)
 * - BSE numeric codes: Add .BO suffix (e.g., 532174 → 532174.BO)
 *
 * Note: Some stocks may have both NSE and BSE listings. We prefer NSE
 * when available for better liquidity and data quality.
 */
const SYMBOL_MAPPINGS: SymbolMapping[] = [
  // Financial Sector
  { excelSymbol: 'HDFCBANK', normalizedSymbol: 'HDFCBANK.NS', exchange: 'NSE' },
  { excelSymbol: 'BAJFINANCE', normalizedSymbol: 'BAJFINANCE.NS', exchange: 'NSE' },
  { excelSymbol: '532174', normalizedSymbol: 'ICICIBANK.NS', exchange: 'NSE' }, // ICICI Bank
  { excelSymbol: '544252', normalizedSymbol: 'BAJAJHOUS.NS', exchange: 'NSE' }, // Bajaj Housing
  { excelSymbol: '511577', normalizedSymbol: '511577.BO', exchange: 'BSE' }, // Savani Financials (only BSE)

  // Tech Sector
  { excelSymbol: 'AFFLE', normalizedSymbol: 'AFFLE.NS', exchange: 'NSE' },
  { excelSymbol: 'LTIM', normalizedSymbol: 'LTIM.NS', exchange: 'NSE' },
  { excelSymbol: '542651', normalizedSymbol: 'KPITTECH.NS', exchange: 'NSE' }, // KPIT Tech
  { excelSymbol: '544028', normalizedSymbol: 'TATATECH.NS', exchange: 'NSE' }, // Tata Tech
  { excelSymbol: '544107', normalizedSymbol: 'BLSE.IRE', exchange: 'NSE' }, // BLS E-Services
  { excelSymbol: '532790', normalizedSymbol: 'TANLA.NS', exchange: 'NSE' }, // Tanla
  { excelSymbol: 'DMART', normalizedSymbol: 'DMART.NS', exchange: 'NSE' },
  { excelSymbol: '532540', normalizedSymbol: 'TATACONSUM.NS', exchange: 'NSE' }, // Tata Consumer
  { excelSymbol: '500331', normalizedSymbol: 'PIDILITIND.NS', exchange: 'NSE' }, // Pidilite
  { excelSymbol: '500400', normalizedSymbol: 'TATAPOWER.NS', exchange: 'NSE' }, // Tata Power
  { excelSymbol: '542323', normalizedSymbol: 'KPIGREEN.NS', exchange: 'NSE' }, // KPI Green
  { excelSymbol: '532667', normalizedSymbol: 'SUZLON.NS', exchange: 'NSE' }, // Suzlon
  { excelSymbol: '542851', normalizedSymbol: 'GENSOL.NS', exchange: 'NSE' }, // Gensol

  // Pipe Sector
  { excelSymbol: '543517', normalizedSymbol: 'HARIOMPIPES.NS', exchange: 'NSE' }, // Hariom Pipes
  { excelSymbol: 'ASTRAL', normalizedSymbol: 'ASTRAL.NS', exchange: 'NSE' },
  { excelSymbol: '542652', normalizedSymbol: 'POLYCAB.NS', exchange: 'NSE' }, // Polycab
  { excelSymbol: '543318', normalizedSymbol: 'CLEANSCI.NS', exchange: 'NSE' }, // Clean Science
  { excelSymbol: '506401', normalizedSymbol: 'DEEPAKNTR.NS', exchange: 'NSE' }, // Deepak Nitrite
  { excelSymbol: '541557', normalizedSymbol: 'FINEORG.NS', exchange: 'NSE' }, // Fine Organic
  { excelSymbol: '533282', normalizedSymbol: 'GRAVITA.NS', exchange: 'NSE' }, // Gravita
  { excelSymbol: '540719', normalizedSymbol: 'SBILIFE.NS', exchange: 'NSE' }, // SBI Life
  { excelSymbol: '500209', normalizedSymbol: 'INFY.NS', exchange: 'NSE' }, // Infy
  { excelSymbol: '543237', normalizedSymbol: 'HAPPSTMNDS.NS', exchange: 'NSE' }, // Happeist Mind
  { excelSymbol: '543272', normalizedSymbol: 'EASEMYTRIP.NS', exchange: 'NSE' }, // Easemytrip
];

/**
 * Symbol mapping registry.
 */
export const symbolMappingRegistry: SymbolMappingRegistry = {
  mappings: new Map(SYMBOL_MAPPINGS.map(m => [m.excelSymbol, m])),
  fallbackStrategy: 'append-suffix',
};

/**
 * Convert Excel symbol to normalized symbol for external API.
 *
 * @param excelSymbol - Symbol as it appears in Excel
 * @returns Normalized symbol compatible with external APIs
 */
export function normalizeSymbol(excelSymbol: string | number): string {
  const symbolStr = String(excelSymbol);

  // Check if we have a specific mapping
  const mapping = symbolMappingRegistry.mappings.get(symbolStr);
  if (mapping) {
    return mapping.normalizedSymbol;
  }

  // Fallback strategy: append suffix based on symbol format
  if (symbolMappingRegistry.fallbackStrategy === 'append-suffix') {
    // If it's numeric, assume BSE and add .BO
    if (/^\d+$/.test(symbolStr)) {
      return `${symbolStr}.BO`;
    }
    // If it's text, assume NSE and add .NS
    return `${symbolStr}.NS`;
  }

  // If no mapping found and no fallback, return as-is
  return symbolStr;
}

/**
 * Get all unique normalized symbols from holdings.
 *
 * @param holdings - Array of portfolio holdings
 * @returns Array of unique normalized symbols
 */
export function getUniqueSymbols(holdings: Array<{ symbol: string }>): string[] {
  const symbols = new Set<string>();
  holdings.forEach(holding => {
    const normalized = normalizeSymbol(holding.symbol);
    symbols.add(normalized);
  });
  return Array.from(symbols);
}

/**
 * Reverse lookup: Find Excel symbol from normalized symbol.
 *
 * @param normalizedSymbol - Normalized symbol
 * @returns Original Excel symbol, or the normalized symbol if not found
 */
export function denormalizeSymbol(normalizedSymbol: string): string {
  for (const [excelSymbol, mapping] of symbolMappingRegistry.mappings) {
    if (mapping.normalizedSymbol === normalizedSymbol) {
      return excelSymbol;
    }
  }
  return normalizedSymbol;
}
