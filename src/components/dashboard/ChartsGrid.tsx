import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import type { DataSummary } from '@/types/equipment';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

interface ChartsGridProps {
  summary: DataSummary | null;
}

const chartColors = [
  'hsl(187, 65%, 45%)',   // chart-1 - teal
  'hsl(220, 70%, 50%)',   // chart-2 - blue
  'hsl(38, 95%, 55%)',    // chart-3 - amber
  'hsl(160, 60%, 45%)',   // chart-4 - green
  'hsl(280, 60%, 55%)',   // chart-5 - purple
  'hsl(340, 70%, 55%)',   // chart-6 - pink
];

const chartColorsTransparent = chartColors.map(c => c.replace(')', ', 0.8)').replace('hsl', 'hsla'));

export function ChartsGrid({ summary }: ChartsGridProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-4" />
            <div className="h-64 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const typeLabels = Object.keys(summary.equipment_type_distribution || {});
  const typeData = Object.values(summary.equipment_type_distribution || {});

  const statusLabels = Object.keys(summary.status_distribution || {});
  const statusData = Object.values(summary.status_distribution || {});

  const manufacturerLabels = Object.keys(summary.manufacturer_distribution || {});
  const manufacturerData = Object.values(summary.manufacturer_distribution || {});

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            family: 'Inter',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equipment Type Distribution - Bar Chart */}
      {typeLabels.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Equipment by Type</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: typeLabels,
                datasets: [
                  {
                    label: 'Count',
                    data: typeData,
                    backgroundColor: chartColorsTransparent,
                    borderColor: chartColors,
                    borderWidth: 2,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'hsl(215, 20%, 92%)',
                    },
                    ticks: {
                      font: { family: 'Inter' },
                    },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Inter' },
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      )}

      {/* Status Distribution - Doughnut Chart */}
      {statusLabels.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                datasets: [
                  {
                    data: statusData,
                    backgroundColor: [
                      'hsl(160, 60%, 45%)',   // operational - green
                      'hsl(38, 95%, 55%)',    // maintenance - amber
                      'hsl(0, 72%, 51%)',     // faulty - red
                      'hsl(215, 15%, 60%)',   // retired - gray
                    ],
                    borderColor: 'white',
                    borderWidth: 3,
                  },
                ],
              }}
              options={{
                ...commonOptions,
                cutout: '55%',
              }}
            />
          </div>
        </Card>
      )}

      {/* Manufacturer Distribution - Horizontal Bar */}
      {manufacturerLabels.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Equipment by Manufacturer</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: manufacturerLabels,
                datasets: [
                  {
                    label: 'Count',
                    data: manufacturerData,
                    backgroundColor: 'hsla(187, 65%, 45%, 0.8)',
                    borderColor: 'hsl(187, 65%, 35%)',
                    borderWidth: 2,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                  ...commonOptions.plugins,
                  legend: { display: false },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      color: 'hsl(215, 20%, 92%)',
                    },
                  },
                  y: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Inter' },
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      )}

      {/* Efficiency Trend - Line Chart */}
      {summary.averages?.efficiency_rating !== undefined && summary.averages.efficiency_rating !== null && summary.averages.efficiency_rating !== 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Efficiency Trend (Sample)</h3>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Avg Efficiency %',
                    data: [82, 84, 83, 87, 86, summary.averages?.efficiency_rating || 0], // Safely access
                    borderColor: 'hsl(187, 65%, 45%)',
                    backgroundColor: 'hsla(187, 65%, 45%, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'hsl(187, 65%, 45%)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100,
                    grid: {
                      color: 'hsl(215, 20%, 92%)',
                    },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
