"use client"

import { useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataVerifikasiPelayanan } from "./monitoring-table"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"

interface MonitoringDashboardProps {
  data: DataVerifikasiPelayanan[]
  loading?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function MonitoringDashboard({ data, loading = false }: MonitoringDashboardProps) {
  // Calculate analytics dengan data unik per NoPendaftaran
  const analytics = useMemo(() => {
    if (!data.length) {
      return {
        totalPasien: 0,
        totalTransaksi: 0,
        totalBiaya: 0,
        statusPeriksa: [],
        ruanganStats: [],
        jenisPasienStats: [],
        dailyTrend: [],
        monthlyTrend: [],
        kelasStats: [],
        verifikasiStats: [],
        // Ringkasan tambahan
        sudahDiperiksa: 0,
        belumDiperiksa: 0,
        batalDiperiksa: 0
      }
    }

    // Unique patients per NoPendaftaran
    const uniquePatientsMap = new Map<string, DataVerifikasiPelayanan>()
    data.forEach(item => {
      if (!uniquePatientsMap.has(item.NoPendaftaran)) {
        uniquePatientsMap.set(item.NoPendaftaran, item)
      }
    })
    const uniquePatients = Array.from(uniquePatientsMap.values())
    const totalPasien = uniquePatients.length
    const totalTransaksi = data.length
    const totalBiaya = data.reduce((sum, item) => sum + (item.TotalBiaya || 0), 0)

    // Status periksa statistics (dari data unik)
    const statusPeriksaMap = new Map<string, number>()
    uniquePatients.forEach(item => {
      const status = item.StatusPeriksa
      statusPeriksaMap.set(status, (statusPeriksaMap.get(status) || 0) + 1)
    })
    
    const statusPeriksa = Array.from(statusPeriksaMap.entries()).map(([status, count]) => ({
      name: status === "Y" ? "Sudah Diperiksa" : status === "T" ? "Belum Diperiksa" : "Batal Pemeriksaan",
      value: count,
      percentage: ((count / totalPasien) * 100).toFixed(1)
    }))

    // Hitung ringkasan status periksa
    const sudahDiperiksa = statusPeriksaMap.get("Y") || 0
    const belumDiperiksa = statusPeriksaMap.get("T") || 0
    const batalDiperiksa = statusPeriksaMap.get("B") || 0

    // Ruangan statistics (dari data unik)
    const ruanganMap = new Map<string, number>()
    uniquePatients.forEach(item => {
      const ruangan = item.RuanganPerawatan || "Unknown"
      ruanganMap.set(ruangan, (ruanganMap.get(ruangan) || 0) + 1)
    })
    const ruanganStats = Array.from(ruanganMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Jenis pasien statistics (dari data unik)
    const jenisPasienMap = new Map<string, number>()
    uniquePatients.forEach(item => {
      const jenis = item.JenisPasien || "Unknown"
      jenisPasienMap.set(jenis, (jenisPasienMap.get(jenis) || 0) + 1)
    })
    const jenisPasienStats = Array.from(jenisPasienMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalPasien) * 100).toFixed(1)
    }))

    // Kelas statistics (dari data unik)
    const kelasMap = new Map<string, number>()
    uniquePatients.forEach(item => {
      const kelas = item.Kelas || "Unknown"
      kelasMap.set(kelas, (kelasMap.get(kelas) || 0) + 1)
    })
    const kelasStats = Array.from(kelasMap.entries()).map(([name, value]) => ({
      name,
      value
    }))

    // Verifikasi statistics (dari data unik)
    const verifikasiMap = new Map<string, number>()
    uniquePatients.forEach(item => {
      let status = "Unknown"
      if (!item.NoBKM) {
        status = "Belum Validasi Kasir"
      } else if (item.NoBKM && !item.TglVerifikasi) {
        status = "Validasi Kasir"
      } else if (item.TglVerifikasi) {
        status = "Verifikasi Keuangan"
      }
      verifikasiMap.set(status, (verifikasiMap.get(status) || 0) + 1)
    })
    const verifikasiStats = Array.from(verifikasiMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalPasien) * 100).toFixed(1)
    }))

    // Daily trend (dari data unik)
    const dailyMap = new Map<string, Set<string>>()
    uniquePatients.forEach(item => {
      if (item.TglPendaftaran) {
        const date = format(parseISO(item.TglPendaftaran), "dd/MM/yyyy")
        if (!dailyMap.has(date)) {
          dailyMap.set(date, new Set())
        }
        dailyMap.get(date)!.add(item.NoPendaftaran)
      }
    })
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, patients]) => ({
        date,
        pasien: patients.size,
        biaya: data
          .filter(item => item.TglPendaftaran && format(parseISO(item.TglPendaftaran), "dd/MM/yyyy") === date)
          .reduce((sum, item) => sum + (item.TotalBiaya || 0), 0)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days

    // Monthly trend (dari data unik)
    const monthlyMap = new Map<string, Set<string>>()
    uniquePatients.forEach(item => {
      if (item.TglPendaftaran) {
        const month = format(parseISO(item.TglPendaftaran), "MMM yyyy", { locale: id })
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, new Set())
        }
        monthlyMap.get(month)!.add(item.NoPendaftaran)
      }
    })
    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, patients]) => ({
        month,
        pasien: patients.size,
        biaya: data
          .filter(item => item.TglPendaftaran && format(parseISO(item.TglPendaftaran), "MMM yyyy", { locale: id }) === month)
          .reduce((sum, item) => sum + (item.TotalBiaya || 0), 0)
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      totalPasien,
      totalTransaksi,
      totalBiaya,
      statusPeriksa,
      ruanganStats,
      jenisPasienStats,
      dailyTrend,
      monthlyTrend,
      kelasStats,
      verifikasiStats,
      sudahDiperiksa,
      belumDiperiksa,
      batalDiperiksa
    }
  }, [data])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Diperluas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Badge variant="outline">Unique</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPasien.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Pasien unik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Badge variant="outline">Records</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTransaksi.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Baris data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
            <Badge variant="outline">Revenue</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {analytics.totalBiaya.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Total pelayanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Diperiksa</CardTitle>
            <Badge className="bg-green-100 text-green-800">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.sudahDiperiksa.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Pasien diperiksa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Diperiksa</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">⏳</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.belumDiperiksa.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Menunggu pemeriksaan</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Batal Diperiksa</CardTitle>
            <Badge variant="destructive">❌</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.batalDiperiksa.toLocaleString("id-ID")}</div>
            <p className="text-xs text-red-600">Pemeriksaan dibatalkan</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Rata-rata Biaya</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">Avg</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {analytics.totalPasien > 0 ? Math.round(analytics.totalBiaya / analytics.totalPasien).toLocaleString("id-ID") : 0}
            </div>
            <p className="text-xs text-blue-600">Per pasien</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Completion Rate</CardTitle>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.totalPasien > 0 ? Math.round((analytics.sudahDiperiksa / analytics.totalPasien) * 100) : 0}%
            </div>
            <p className="text-xs text-purple-600">Tingkat kelengkapan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Periksa</TabsTrigger>
          <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
          <TabsTrigger value="ruangan">Top Ruangan</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Periksa Pasien</CardTitle>
                <CardDescription>Distribusi status pemeriksaan pasien (data unik)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusPeriksa}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusPeriksa.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jenis Pasien</CardTitle>
                <CardDescription>Distribusi jenis pasien (data unik)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.jenisPasienStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verifikasi" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Verifikasi</CardTitle>
                <CardDescription>Status verifikasi keuangan (data unik)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.verifikasiStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.verifikasiStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kelas</CardTitle>
                <CardDescription>Pasien per kelas perawatan (data unik)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.kelasStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ruangan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Ruangan Perawatan</CardTitle>
              <CardDescription>Ruangan dengan kunjungan pasien terbanyak (data unik)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.ruanganStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Kunjungan Harian (30 Hari Terakhir)</CardTitle>
              <CardDescription>Jumlah pasien dan biaya per hari (data unik)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="pasien" fill="#8884d8" name="Jumlah Pasien" />
                  <Line yAxisId="right" type="monotone" dataKey="biaya" stroke="#82ca9d" name="Total Biaya" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {analytics.monthlyTrend.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Trend Bulanan</CardTitle>
                <CardDescription>Jumlah pasien dan biaya per bulan (data unik)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="pasien" fill="#8884d8" name="Jumlah Pasien" />
                    <Line yAxisId="right" type="monotone" dataKey="biaya" stroke="#82ca9d" name="Total Biaya" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}