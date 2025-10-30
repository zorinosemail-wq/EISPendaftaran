"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, TrendingUp } from "lucide-react";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

interface TopRoomsChartProps {
  data: ChartData;
}

export function TopRoomsChart({ data }: TopRoomsChartProps) {
  // Transform data untuk horizontal bar chart dengan informasi lengkap
  const chartData = data.labels.map((room, index) => ({
    name: room,
    pasien: data.datasets[0].data[index],
    percentage: Math.round((data.datasets[0].data[index] / data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100),
    color: data.datasets[0].backgroundColor?.[index] || '#3b82f6'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-blue-600">{data.pasien} pasien</p>
          <p className="text-xs text-gray-500">{data.percentage}% dari total</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width + 5} 
        y={y + 15} 
        fill="#374151" 
        fontSize="12" 
        fontWeight="500"
        textAnchor="start"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-blue-600" />
            Top 10 Ruangan Paling Banyak Digunakan
          </div>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            {data.datasets[0].data.reduce((a, b) => a + b, 0)} Total Pasien
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                width={75}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="pasien" 
                radius={[0, 4, 4, 0]}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Ruangan Teratas</p>
            <p className="text-sm font-bold text-blue-900">{chartData[0]?.name || '-'}</p>
            <p className="text-xs text-blue-700">{chartData[0]?.pasien || 0} pasien</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Rata-rata</p>
            <p className="text-sm font-bold text-green-900">
              {Math.round(data.datasets[0].data.reduce((a, b) => a + b, 0) / data.labels.length)} pasien
            </p>
            <p className="text-xs text-green-700">per ruangan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}