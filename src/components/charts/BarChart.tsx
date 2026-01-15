import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  bars: Array<{ dataKey: string; name: string; color: string }>;
  className?: string;
}

export function BarChart({
  title,
  description,
  data,
  dataKey,
  bars,
  className,
}: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {bars.map((bar) => (
              <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
