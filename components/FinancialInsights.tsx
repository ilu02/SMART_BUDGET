'use client';

export default function FinancialInsights() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Financial Insights</h3>
      <ul className="space-y-2">
        <li className="flex items-center">
          <span className="text-green-500 mr-2">▲</span>
          <span>Your spending on groceries is 15% lower this month.</span>
        </li>
        <li className="flex items-center">
          <span className="text-yellow-500 mr-2">●</span>
          <span>You have a recurring subscription of $12.99 that will be charged in 3 days.</span>
        </li>
        <li className="flex items-center">
          <span className="text-green-500 mr-2">▲</span>
          <span>Your income has increased by 8% compared to last month.</span>
        </li>
      </ul>
    </div>
  );
}
