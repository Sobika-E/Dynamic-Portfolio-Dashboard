/**
 * Sector Chart Component
 *
 * Displays investment vs present value by sector using a bar chart.
 */

import { SectorSummary } from '@/types/portfolio';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SectorChartProps {
  sectors: SectorSummary[];
}

export default function SectorChart({ sectors }: SectorChartProps) {
  const data = sectors.map((sector) => ({
    sector: sector.sector,
    investment: sector.investment,
    presentValue: sector.presentValue,
    gainLoss: sector.gainLoss,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Investment vs Present Value by Sector</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="sector"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            stroke="#6b7280"
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="investment" fill="#3B82F6" name="Investment" radius={[4, 4, 0, 0]} />
          <Bar dataKey="presentValue" fill="#10B981" name="Present Value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
