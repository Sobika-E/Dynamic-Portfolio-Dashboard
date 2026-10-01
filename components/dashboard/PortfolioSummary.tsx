/**
 * Portfolio Summary Component
 *
 * Displays key portfolio metrics: Total Investment, Current Value, Gain/Loss, Overall Return.
 */

import { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { formatCurrency, formatPercent, getGainLossColor, getGainLossSign } from '@/lib/calculations';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Investment */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">Total Investment</p>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(summary.totalInvestment)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {summary.stockCount} stocks across {summary.sectorCount} sectors
        </p>
      </div>

      {/* Current Portfolio Value */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">Current Value</p>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(summary.totalPresentValue)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {summary.totalPresentValue > summary.totalInvestment ? 'Gain' : 'Loss'} in value
        </p>
      </div>

      {/* Total Gain/Loss */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">Total Gain/Loss</p>
          <div className={`w-10 h-10 ${summary.totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={summary.totalGainLoss >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold ${getGainLossColor(summary.totalGainLoss)}`}>
          {getGainLossSign(summary.totalGainLoss)}
          {formatCurrency(summary.totalGainLoss)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {summary.totalGainLoss >= 0 ? 'Profit' : 'Loss'}
        </p>
      </div>

      {/* Overall Return */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">Overall Return</p>
          <div className={`w-10 h-10 ${summary.overallReturn >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${summary.overallReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <p className={`text-3xl font-bold ${getGainLossColor(summary.overallReturn)}`}>
          {getGainLossSign(summary.overallReturn)}
          {formatPercent(summary.overallReturn)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {summary.overallReturn >= 0 ? 'Positive' : 'Negative'} return
        </p>
      </div>
    </div>
  );
}
