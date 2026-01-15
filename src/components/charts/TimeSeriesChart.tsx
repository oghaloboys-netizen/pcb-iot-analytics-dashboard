import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricHistory } from '@/types/analytics';

interface TimeSeriesChartProps {
  title: string;
  description?: string;
  data: MetricHistory[];
  dataKey?: string;
  color?: string;
  unit?: string;
  className?: string;
}

export function TimeSeriesChart({
  title,
  description,
  data,
  dataKey = 'value',
  color = '#8884d8',
  unit = '',
  className,
}: TimeSeriesChartProps) {
  const formattedData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    value: Number(item.value.toFixed(2)),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis unit={unit} />
            <Tooltip
              formatter={(value: number) => [`${value}${unit}`, title]}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
