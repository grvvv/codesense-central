import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { SeverityData } from '@/types/dashboard';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="p-3 border rounded-md shadow-lg text-sm font-medium
        bg-white text-gray-800 border-gray-200
        dark:bg-[#1f1f1f] dark:text-white dark:border-[#3a3a3a]">
        <p style={{ color: entry.color }}>
          {`${entry.payload.type}: ${entry.value}`}
        </p>
      </div>
    );
  }
  return null;
};

const ChartComponent = ({ data }: { data: SeverityData }) => {
  const current = data;

  const chartData = [
    { type: 'Critical', value: current.critical },
    { type: 'High', value: current.high },
    { type: 'Medium', value: current.medium },
    { type: 'Low', value: current.low },
  ];

  const colors: Record<string, string> = {
    Critical: '#7e0e0e',
    High: '#be0707',
    Medium: '#ffc000',
    Low: '#04c73b'
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#2d2d2d] rounded-xl shadow-lg border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
      {/* Toggle Buttons */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            Severity Counts
          </h3>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-lg border border-gray-100 dark:border-[#3a3a3a]">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              barCategoryGap="30%"
            >
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={14}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                stroke="#6b7280"
                fontSize={14}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(191, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
