/**
 * Portfolio Table Component
 *
 * Displays all portfolio holdings in a responsive table.
 */

import { PortfolioHolding } from '@/types/portfolio';
import { formatCurrency, formatPercent, getGainLossColor, getGainLossSign } from '@/lib/calculations';

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
}

export default function PortfolioTable({ holdings }: PortfolioTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Holdings</h2>
        <p className="text-sm text-gray-500 mt-1">{holdings.length} stocks in portfolio</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Portfolio %
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                CMP
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Present Value
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                P/E
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Earnings
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {holdings.map((holding, index) => (
              <tr
                key={holding.id}
                className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {holding.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">{holding.name}</div>
                      <div className="text-xs text-gray-500">{holding.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(holding.purchasePrice)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{holding.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(holding.investment)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatPercent(holding.portfolioPercent)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {holding.cmp ? formatCurrency(holding.cmp) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {holding.presentValue ? formatCurrency(holding.presentValue) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {holding.gainLoss !== undefined ? (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      holding.gainLoss >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getGainLossSign(holding.gainLoss)}
                      {formatCurrency(holding.gainLoss)}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {holding.peRatio ? holding.peRatio.toFixed(2) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {holding.latestEarnings ? holding.latestEarnings.toFixed(2) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
