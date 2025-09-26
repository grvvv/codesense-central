import type { SystemStatus } from '@/types/dashboard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DonutChart = ({ data }: { data: SystemStatus}) => {

  const counts = data?.counts || {};
  const total = data?.total_scans || 0;

  // Map Mongo counts object to recharts format
  const chartData = Object.entries(counts).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value,
    color:
      status === 'success'
        ? '#8b0000'
        : status === 'completed'
        ? '#bf0000'
        : status === 'failed'
        ? '#ff4444'
        : '#ff7777'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="bg-white dark:bg-brand-dark/90 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dataPoint.payload.color }}
            ></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {dataPoint.name}: {dataPoint.value} scans
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {((dataPoint.value / total) * 100).toFixed(1)}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-lg border border-gray-200 dark:border-[#444] p-6 max-w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          Scan Overview
        </h3>
        <p className="text-sm text-gray-600 dark:text-[#e5e5e5]">
          Total scans: {total}
        </p>
      </div>

      <div className="flex items-center gap-4 justify-around">
        <div className="relative flex-shrink-0">
          <ResponsiveContainer width={350} height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={160}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-5xl font-bold text-gray-800 dark:text-white">
              {total}
            </div>
            <div className="text-base font-medium text-gray-600 dark:text-[#e5e5e5] mt-2">
              TOTAL SCANS
            </div>
          </div>
        </div>

        <div className="space-y-2 ml-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm text-gray-700 dark:text-[#e5e5e5] font-medium">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {item.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
