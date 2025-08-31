'use client';

interface InsightItem {
  label: string;
  value: string;
  color: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface QuickInsightsProps {
  insights: InsightItem[];
}

export default function QuickInsights({ insights }: QuickInsightsProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <i className="ri-lightbulb-line text-white text-sm" aria-hidden="true"></i>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Quick Insights</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 ${insight.color} rounded-lg flex items-center justify-center`}>
                <i className={`${insight.icon} text-white text-sm`} aria-hidden="true"></i>
              </div>
              {insight.trend && (
                <div className={`flex items-center space-x-1 ${
                  insight.trend === 'up' 
                    ? 'text-green-600' 
                    : insight.trend === 'down' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  <i className={`${
                    insight.trend === 'up' 
                      ? 'ri-trending-up-line' 
                      : insight.trend === 'down' 
                      ? 'ri-trending-down-line' 
                      : 'ri-subtract-line'
                  } text-xs`} aria-hidden="true"></i>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{insight.label}</p>
            <p className="text-lg font-bold text-gray-900">{insight.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}