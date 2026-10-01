/**
 * Allocation Chart Component
 *
 * Displays portfolio allocation by sector using a pie chart.
 */

import { SectorSummary } from '@/types/portfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AllocationChartProps {
  sectors: SectorSummary[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AllocationChart({ sectors }: AllocationChartProps) {
  const data = sectors.map((sector) => ({
    name: sector.sector,
    value: sector.investment,
    percentage: sector.portfolioPercent,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio Allocation by Sector</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Investment']}
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
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
