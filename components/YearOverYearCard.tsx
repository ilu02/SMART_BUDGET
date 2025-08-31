'use client';

export default function YearOverYearCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h3>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">This Year</p>
          <p className="text-2xl font-bold">$45,231</p>
        </div>
        <div>
          <p className="text-gray-500">Last Year</p>
          <p className="text-2xl font-bold">$42,897</p>
        </div>
        <div>
          <p className="text-gray-500">Change</p>
          <p className="text-2xl font-bold text-green-500">+5.4%</p>
        </div>
      </div>
    </div>
  );
}
