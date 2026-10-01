/**
 * Initialize Portfolio Data
 *
 * This script converts the Excel file to JSON format for faster loading.
 * Run this once to generate the initial portfolio.json file.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load Excel file
const excelPath = path.join(__dirname, '../../F9001561_ADDBA737E8_B72562937A.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to array of arrays
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

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
const holdings = [];
let currentSector = null;

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
    const holding = {
      id: particulars
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      sector: currentSector || 'Uncategorized',
      name: particulars.trim(),
      symbol: row[6] ? String(row[6]) : '',
      purchasePrice: Number(row[2]) || 0,
      quantity: Number(row[3]) || 0,
      investment: Number(row[4]) || 0,
      portfolioPercent: Number(row[5]) || 0,
      cmp: row[7] ? Number(row[7]) : undefined,
      presentValue: row[8] ? Number(row[8]) : undefined,
      gainLoss: row[9] ? Number(row[9]) : undefined,
      gainLossPercent: row[10] ? Number(row[10]) : undefined,
      peRatio: typeof row[12] === 'number' ? row[12] : undefined,
      latestEarnings: typeof row[13] === 'number' ? row[13] : undefined,
    };
    holdings.push(holding);
  }
}

// Calculate total investment
const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);

// Recalculate portfolio percentages
holdings.forEach(holding => {
  holding.portfolioPercent = totalInvestment > 0 ? (holding.investment / totalInvestment) * 100 : 0;
});

// Save to JSON
const outputPath = path.join(__dirname, 'portfolio.json');
fs.writeFileSync(outputPath, JSON.stringify({ holdings }, null, 2));

console.log(`Portfolio data saved to ${outputPath}`);
console.log(`Total holdings: ${holdings.length}`);
console.log(`Total investment: ₹${totalInvestment.toLocaleString('en-IN')}`);
