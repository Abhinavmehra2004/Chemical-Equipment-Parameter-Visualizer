import { Package, DollarSign, Gauge, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DataSummary } from '@/types/equipment';

interface StatsCardsProps {
  summary: DataSummary | null;
}

export function StatsCards({ summary }: StatsCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-3" />
            <div className="h-8 bg-muted rounded w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const operationalCount = summary.status_distribution?.operational || 0;
  const totalCount = summary.total_count ?? 0; // Use nullish coalescing for default 0
  const operationalRate = totalCount > 0 ? Math.round((operationalCount / totalCount) * 100) : 0;
  const faultyCount = summary.status_distribution?.faulty || 0;

  const stats = [];

  if (summary.total_count !== undefined && summary.total_count !== null) {
    stats.push({
      label: 'Total Equipment',
      value: summary.total_count.toLocaleString(),
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    });
  }

  if (summary.averages?.cost !== undefined && summary.averages.cost !== null) {
    stats.push({
      label: 'Avg. Cost',
      value: `$${summary.averages.cost.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    });
  }

  if (summary.averages?.efficiency_rating && summary.averages.efficiency_rating !== 0) {
    stats.push({
      label: 'Avg. Efficiency',
      value: `${summary.averages.efficiency_rating}%`,
      icon: Gauge,
      color: 'text-info',
      bgColor: 'bg-info/10',
    });
  }

  if (summary.averages?.runtime_hours && summary.averages.runtime_hours !== 0) {
    stats.push({
      label: 'Avg. Runtime',
      value: `${summary.averages.runtime_hours.toLocaleString()}h`,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
