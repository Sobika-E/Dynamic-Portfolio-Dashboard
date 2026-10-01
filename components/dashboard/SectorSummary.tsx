/**
 * Sector Summary Component
 *
 * Displays sector-wise portfolio summary with expand/collapse functionality.
 */

import { SectorSummary as SectorSummaryType } from '@/types/portfolio';
import { formatCurrency, formatPercent, getGainLossColor, getGainLossSign } from '@/lib/calculations';

interface SectorSummaryProps {
  sectors: SectorSummaryType[];
  expandedSectors: Set<string>;
  onToggleSector: (sector: string) => void;
}

export default function SectorSummary({
  sectors,
  expandedSectors,
  onToggleSector,
}: SectorSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Sector Summary</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {sectors.map((sector, index) => {
          const isExpanded = expandedSectors.has(sector.sector);

          return (
            <div key={sector.sector} className={`p-6 hover:bg-gray-50 transition-colors ${index === 0 ? 'pt-6' : ''}`}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onToggleSector(sector.sector)}
              >
                <div className="flex items-center space-x-4">
                  <button
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <svg
                      className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{sector.sector}</h3>
                    <span className="text-xs text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">
                      {sector.stockCount} stocks
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Investment</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(sector.investment)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Present Value</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(sector.presentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Gain/Loss</p>
                    <p className={`font-semibold ${getGainLossColor(sector.gainLoss)}`}>
                      {getGainLossSign(sector.gainLoss)}
                      {formatCurrency(sector.gainLoss)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Return</p>
                    <p className={`font-semibold ${getGainLossColor(sector.gainLossPercent)}`}>
                      {getGainLossSign(sector.gainLossPercent)}
                      {formatPercent(sector.gainLossPercent)}
                    </p>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pl-10 text-sm bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Portfolio Weight</p>
                      <p className="font-semibold text-gray-900">{formatPercent(sector.portfolioPercent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock Count</p>
                      <p className="font-semibold text-gray-900">{sector.stockCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
