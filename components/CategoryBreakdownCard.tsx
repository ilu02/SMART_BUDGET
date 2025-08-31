'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type DataPoint = {
  name: string;
  value: number;
  percentage: number;
};

type InitialData = {
  [key: string]: DataPoint[];
};

const initialData: InitialData = {
  'This Month': [
    { name: 'Food & Dining', value: 405, percentage: 18.9 },
    { name: 'Transportation', value: 299, percentage: 11.5 },
    { name: 'Entertainment', value: 246, percentage: 9.4 },
    { name: 'Shopping', value: 675, percentage: 25.3 },
    { name: 'Health & Fitness', value: 145, percentage: 5.5 },
    { name: 'Bills & Utilities', value: 757, percentage: 29.3 },
  ],
  'Last Month': [
    { name: 'Food & Dining', value: 350, percentage: 17.9 },
    { name: 'Transportation', value: 320, percentage: 12.5 },
    { name: 'Entertainment', value: 280, percentage: 10.4 },
    { name: 'Shopping', value: 600, percentage: 24.3 },
    { name: 'Health & Fitness', value: 160, percentage: 6.5 },
    { name: 'Bills & Utilities', value: 800, percentage: 28.3 },
  ],
  'This Year': [
    { name: 'Food & Dining', value: 4500, percentage: 19.9 },
    { name: 'Transportation', value: 3500, percentage: 13.5 },
    { name: 'Entertainment', value: 3000, percentage: 11.4 },
    { name: 'Shopping', value: 7000, percentage: 26.3 },
    { name: 'Health & Fitness', value: 2000, percentage: 7.5 },
    { name: 'Bills & Utilities', value: 8500, percentage: 31.3 },
  ],
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function CategoryBreakdownCard() {
  const [timeRange, setTimeRange] = useState<keyof InitialData>('This Month');
  const data = initialData[timeRange];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Category Breakdown</h3>
        <select
          aria-label="Select month"
          className="text-sm border-gray-300 rounded-md"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry: DataPoint, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center">
          <ul>
            {data.map((entry: DataPoint, index: number) => (
              <li key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold">${entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
