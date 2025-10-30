"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BedDouble, TrendingUp, Users, BarChart3 } from "lucide-react";

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

interface TopRoomsTableProps {
  data: ChartData;
}

export function TopRoomsTable({ data }: TopRoomsTableProps) {
  // Transform data untuk tabel
  const tableData = data.labels.map((room, index) => ({
    rank: index + 1,
    room: room,
    patients: data.datasets[0].data[index],
    percentage: Math.round((data.datasets[0].data[index] / data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100),
    color: data.datasets[0].backgroundColor?.[index] || '#3b82f6'
  }));

  const getTotalPatients = () => {
    return data.datasets[0].data.reduce((a, b) => a + b, 0);
  };

  const getAveragePatients = () => {
    return Math.round(getTotalPatients() / data.labels.length);
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
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
            <BarChart3 className="h-3 w-3 mr-1" />
            Tabel View
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Ruangan Teratas</p>
            </div>
            <p className="text-sm font-bold text-blue-900">{tableData[0]?.room || '-'}</p>
            <p className="text-xs text-blue-700">{tableData[0]?.patients || 0} pasien</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Total Pasien</p>
            </div>
            <p className="text-sm font-bold text-green-900">{getTotalPatients().toLocaleString('id-ID')}</p>
            <p className="text-xs text-green-700">10 ruangan</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">Rata-rata</p>
            </div>
            <p className="text-sm font-bold text-purple-900">{getAveragePatients()}</p>
            <p className="text-xs text-purple-700">pasien/ruangan</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead className="w-48">Nama Ruangan</TableHead>
                <TableHead className="text-center">Jumlah Pasien</TableHead>
                <TableHead className="text-center">Persentase</TableHead>
                <TableHead className="w-24">Visual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.rank} className="hover:bg-gray-50">
                  <TableCell className="text-center">
                    <Badge variant={getRankBadgeVariant(item.rank)} className="text-xs">
                      {getRankIcon(item.rank)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.room}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-sm">{item.patients.toLocaleString('id-ID')}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total 10 ruangan dengan {getTotalPatients().toLocaleString('id-ID')} pasien</span>
            <span>Rata-rata {getAveragePatients()} pasien per ruangan</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}