'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Spending: 2400, Income: 4400 },
  { name: 'Feb', Spending: 1800, Income: 4400 },
  { name: 'Mar', Spending: 3200, Income: 4500 },
  { name: 'Apr', Spending: 2800, Income: 4300 },
  { name: 'May', Spending: 3400, Income: 4400 },
  { name: 'Jun', Spending: 3000, Income: 4400 },
  { name: 'Jul', Spending: 2800, Income: 4400 },
];

export default function SpendingTrendsCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Spending" stroke="#ef4444" />
          <Line type="monotone" dataKey="Income" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
