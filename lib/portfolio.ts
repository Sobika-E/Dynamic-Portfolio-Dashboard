/**
 * Portfolio Data Service
 *
 * This file handles loading and normalizing portfolio data from the Excel file.
 * The Excel file is converted to JSON during build/initialization.
 */

import * as XLSX from 'xlsx';
import { PortfolioHolding, RawStockData } from '../types/portfolio';
import { normalizeSymbol } from './symbol-mapping';
import { calculateInvestment, calculatePortfolioPercent } from './calculations';

/**
 * Load and parse Excel file, convert to normalized portfolio holdings.
 */
export function loadPortfolioFromExcel(filePath: string): PortfolioHolding[] {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row && row.includes('Particulars')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Could not find header row in Excel file');
    }

    // Parse data
    const rawStocks: RawStockData[] = [];
    let currentSector: string | null = null;

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const no = row[0];
      const particulars = row[1];

      // Check for sector row
      if (!no && particulars && typeof particulars === 'string' && particulars.includes('Sector')) {
        currentSector = particulars.trim();
        continue;
      }

      // Check for stock row
      if (no && particulars && typeof particulars === 'string' && particulars !== 'Particulars') {
        const rawStock: RawStockData = {
          row: i,
          no: no as number | string,
          name: particulars.trim(),
          purchasePrice: Number(row[2]) || 0,
          quantity: Number(row[3]) || 0,
          investment: Number(row[4]) || 0,
          portfolioPercent: Number(row[5]) || 0,
          symbol: row[6] ? String(row[6]) : '',
          cmp: row[7] ? Number(row[7]) : undefined,
          presentValue: row[8] ? Number(row[8]) : undefined,
          gainLoss: row[9] ? Number(row[9]) : undefined,
          gainLossPercent: row[10] ? Number(row[10]) : undefined,
          marketCap: row[11] as number | string | undefined,
          peTTM: row[12] as number | string | undefined,
          latestEarnings: row[13] as number | string | undefined,
          sector: currentSector || 'Uncategorized',
        };
        rawStocks.push(rawStock);
      }
    }

    // Normalize to PortfolioHolding
    const holdings: PortfolioHolding[] = rawStocks.map((raw, index) => {
      const investment = calculateInvestment(raw.purchasePrice, raw.quantity);

      return {
        id: generateId(raw.name),
        sector: raw.sector,
        name: raw.name,
        symbol: normalizeSymbol(raw.symbol),
        purchasePrice: raw.purchasePrice,
        quantity: raw.quantity,
        investment,
        portfolioPercent: raw.portfolioPercent,
        cmp: raw.cmp,
        presentValue: raw.presentValue,
        gainLoss: raw.gainLoss,
        gainLossPercent: raw.gainLossPercent,
        peRatio: typeof raw.peTTM === 'number' ? raw.peTTM : undefined,
        latestEarnings: typeof raw.latestEarnings === 'number' ? raw.latestEarnings : undefined,
      };
    });

    // Calculate portfolio percentages
    const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    holdings.forEach(holding => {
      holding.portfolioPercent = calculatePortfolioPercent(holding.investment, totalInvestment);
    });

    return holdings;
  } catch (error) {
    console.error('Error loading portfolio from Excel:', error);
    throw error;
  }
}

/**
 * Generate a unique ID from stock name.
 * Converts "HDFC Bank" to "hdfc-bank"
 */
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Load portfolio from JSON file (faster for production).
 */
export function loadPortfolioFromJSON(filePath: string): PortfolioHolding[] {
  try {
    const fs = require('fs');
    const path = require('path');
    // Resolve relative paths from the project root rather than the process working directory
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const data = fs.readFileSync(resolvedPath, 'utf-8');
    const json = JSON.parse(data);
    return json.holdings || [];
  } catch (error) {
    console.error('Error loading portfolio from JSON:', error);
    throw error;
  }
}

/**
 * Save portfolio to JSON file.
 */
export function savePortfolioToJSON(holdings: PortfolioHolding[], filePath: string): void {
  try {
    const fs = require('fs');
    const data = JSON.stringify({ holdings }, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
  } catch (error) {
    console.error('Error saving portfolio to JSON:', error);
    throw error;
  }
}
