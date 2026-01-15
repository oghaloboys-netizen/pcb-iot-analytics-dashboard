import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: '',
    success: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
    danger: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20',
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="mt-1">
            {description}
            {trend && trendValue && (
              <span className={cn('ml-2', trendColors[trend])}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
