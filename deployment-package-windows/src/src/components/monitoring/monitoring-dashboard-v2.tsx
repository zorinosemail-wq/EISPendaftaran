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
import { TopRoomsTable } from "@/components/TopRoomsTable"
import { DataVerifikasiPelayanan } from "./monitoring-table"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"

interface MonitoringDashboardProps {
  data: DataVerifikasiPelayanan[]
  loading?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function MonitoringDashboardV2({ data, loading = false }: MonitoringDashboardProps) {
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

    // Calculate financial breakdown statistics
    const totalHutangPenjamin = data.reduce((sum, item) => sum + (item.TotalHutangPenjamin || 0), 0)
    const totalTanggunganRS = data.reduce((sum, item) => sum + (item.TotalTanggunganRS || 0), 0)
    const totalPembebasan = data.reduce((sum, item) => sum + (item.TotalPembebasan || 0), 0)
    const totalHarusDiBayar = data.reduce((sum, item) => sum + (item.TotalHarusDiBayar || 0), 0)
    const grandTotal = data.reduce((sum, item) => sum + (item.GrandTotal || 0), 0)

    // Financial breakdown for charts
    const financialBreakdown = [
      { name: 'Hutang Penjamin', value: totalHutangPenjamin, percentage: totalBiaya > 0 ? ((totalHutangPenjamin / totalBiaya) * 100).toFixed(1) : '0' },
      { name: 'Tanggungan RS', value: totalTanggunganRS, percentage: totalBiaya > 0 ? ((totalTanggunganRS / totalBiaya) * 100).toFixed(1) : '0' },
      { name: 'Pembebasan', value: totalPembebasan, percentage: totalBiaya > 0 ? ((totalPembebasan / totalBiaya) * 100).toFixed(1) : '0' },
      { name: 'Harus Dibayar', value: totalHarusDiBayar, percentage: totalBiaya > 0 ? ((totalHarusDiBayar / totalBiaya) * 100).toFixed(1) : '0' },
      { name: 'Grand Total', value: grandTotal, percentage: totalBiaya > 0 ? ((grandTotal / totalBiaya) * 100).toFixed(1) : '0' }
    ]

    // Filter data for top rooms and trends (only patients who have been examined)
    const examinedPatients = uniquePatients.filter(item => item.StatusPeriksa === "Y")

    // Hitung ringkasan status periksa
    const sudahDiperiksa = statusPeriksaMap.get("Y") || 0
    const belumDiperiksa = statusPeriksaMap.get("T") || 0
    const batalDiperiksa = statusPeriksaMap.get("B") || 0

    // Ruangan statistics untuk TopRoomsChart (hanya pasien sudah diperiksa)
    const ruanganMap = new Map<string, number>()
    examinedPatients.forEach(item => {
      const ruangan = item.RuanganPerawatan || "Unknown"
      ruanganMap.set(ruangan, (ruanganMap.get(ruangan) || 0) + 1)
    })
    const ruanganStats = Array.from(ruanganMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Data per ruangan untuk tabel (dengan breakdown status)
    const uniquePatientsByRoom: Record<string, { sudah: number; belum: number; batal: number; total: number }> = {}
    uniquePatients.forEach(item => {
      const ruangan = item.RuanganPerawatan || "Unknown"
      if (!uniquePatientsByRoom[ruangan]) {
        uniquePatientsByRoom[ruangan] = { sudah: 0, belum: 0, batal: 0, total: 0 }
      }
      
      if (item.StatusPeriksa === "Y") {
        uniquePatientsByRoom[ruangan].sudah++
      } else if (item.StatusPeriksa === "T") {
        uniquePatientsByRoom[ruangan].belum++
      } else if (item.StatusPeriksa === "B") {
        uniquePatientsByRoom[ruangan].batal++
      }
      uniquePatientsByRoom[ruangan].total++
    })

    // Format data untuk TopRoomsChart
    const topRoomsChartData = {
      labels: ruanganStats.map(item => item.name),
      datasets: [{
        label: 'Jumlah Pasien',
        data: ruanganStats.map(item => item.value),
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
          '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ],
        borderColor: [
          '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
          '#db2777', '#0891b2', '#65a30d', '#ea580c', '#4f46e5'
        ],
        borderWidth: 1
      }]
    }

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

    // Daily trend (hanya pasien sudah diperiksa)
    const dailyMap = new Map<string, Set<string>>()
    examinedPatients.forEach(item => {
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

    // Monthly trend (hanya pasien sudah diperiksa)
    const monthlyMap = new Map<string, Set<string>>()
    examinedPatients.forEach(item => {
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
      topRoomsChartData,
      sudahDiperiksa,
      belumDiperiksa,
      batalDiperiksa,
      uniquePatientsByRoom,
      // New financial analytics
      totalHutangPenjamin,
      totalTanggunganRS,
      totalPembebasan,
      totalHarusDiBayar,
      grandTotal,
      financialBreakdown
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
    <div className="space-y-8">
      {/* Summary Cards - Kelompok Utama */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Ringkasan Utama</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
              <Badge variant="outline">Unique</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalPasien.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground">Pasien unik</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <Badge variant="outline">Records</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.totalTransaksi.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground">Baris data</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
              <Badge variant="outline">Revenue</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Rp {analytics.totalBiaya.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground">Total pelayanan</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grand Total</CardTitle>
              <Badge className="bg-indigo-100 text-indigo-800">💰</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">Rp {analytics.grandTotal.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground">Setelah potongan</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Diperiksa</CardTitle>
              <Badge className="bg-green-100 text-green-800">✓</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.sudahDiperiksa.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground">Pasien diperiksa</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Periksa Analysis - Kelompok Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📋 Analisa Status Periksa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Sudah Diperiksa</CardTitle>
              <Badge className="bg-green-100 text-green-800">✓</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.sudahDiperiksa.toLocaleString("id-ID")}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analytics.totalPasien > 0 ? (analytics.sudahDiperiksa / analytics.totalPasien) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-green-600">
                  {analytics.totalPasien > 0 ? Math.round((analytics.sudahDiperiksa / analytics.totalPasien) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Belum Diperiksa</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">⏳</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analytics.belumDiperiksa.toLocaleString("id-ID")}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${analytics.totalPasien > 0 ? (analytics.belumDiperiksa / analytics.totalPasien) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-yellow-600">
                  {analytics.totalPasien > 0 ? Math.round((analytics.belumDiperiksa / analytics.totalPasien) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Batal Diperiksa</CardTitle>
              <Badge variant="destructive">❌</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.batalDiperiksa.toLocaleString("id-ID")}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${analytics.totalPasien > 0 ? (analytics.batalDiperiksa / analytics.totalPasien) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-red-600">
                  {analytics.totalPasien > 0 ? Math.round((analytics.batalDiperiksa / analytics.totalPasien) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Breakdown - Kelompok Keuangan */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">💰 Breakdown Keuangan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-purple-50 border-purple-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Hutang Penjamin</CardTitle>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">🏥</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Rp {analytics.totalHutangPenjamin.toLocaleString("id-ID")}</div>
              <p className="text-xs text-purple-600">{analytics.financialBreakdown[0]?.percentage}% dari total</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Tanggungan RS</CardTitle>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">🏥</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Rp {analytics.totalTanggunganRS.toLocaleString("id-ID")}</div>
              <p className="text-xs text-orange-600">{analytics.financialBreakdown[1]?.percentage}% dari total</p>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 border-cyan-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">Harus Dibayar</CardTitle>
              <Badge variant="outline" className="bg-cyan-100 text-cyan-800">💳</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">Rp {analytics.totalHarusDiBayar.toLocaleString("id-ID")}</div>
              <p className="text-xs text-cyan-600">{analytics.financialBreakdown[3]?.percentage}% dari total</p>
            </CardContent>
          </Card>

          <Card className="bg-pink-50 border-pink-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Pembebasan</CardTitle>
              <Badge variant="outline" className="bg-pink-100 text-pink-800">🆓</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">Rp {analytics.totalPembebasan.toLocaleString("id-ID")}</div>
              <p className="text-xs text-pink-600">{analytics.financialBreakdown[2]?.percentage}% dari total</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Metrics - Kelompok Metrik Tambahan */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Metrik Tambahan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200 shadow-sm">
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

          <Card className="bg-purple-50 border-purple-200 shadow-sm">
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
      </div>

      {/* Charts & Tables */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Grafik & Tabel Analisis</h3>
        <Tabs defaultValue="ruangan-table" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ruangan-table">Data per Ruangan</TabsTrigger>
            <TabsTrigger value="financial">Financial Breakdown</TabsTrigger>
            <TabsTrigger value="status">Status Periksa</TabsTrigger>
            <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
            <TabsTrigger value="ruangan">Top Ruangan</TabsTrigger>
            <TabsTrigger value="trend">Trend</TabsTrigger>
          </TabsList>

        <TabsContent value="ruangan-table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Pasien per Ruangan Perawatan</CardTitle>
              <CardDescription>
                Jumlah pasien diperiksa, belum diperiksa, dan batal per ruangan perawatan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Ruangan Perawatan</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Sudah Diperiksa</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Belum Diperiksa</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Batal</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Total Pasien</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.ruanganStats.map((ruangan, index) => {
                      const ruanganData = analytics.uniquePatientsByRoom[ruangan.name] || { sudah: 0, belum: 0, batal: 0, total: 0 }
                      const completionRate = ruanganData.total > 0 
                        ? Math.round((ruanganData.sudah / ruanganData.total) * 100) 
                        : 0
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {ruangan.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {ruanganData.sudah}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {ruanganData.belum}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {ruanganData.batal}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                            {ruanganData.total}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-[60px]">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{completionRate}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">TOTAL</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-green-600">
                        {analytics.sudahDiperiksa}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-yellow-600">
                        {analytics.belumDiperiksa}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-red-600">
                        {analytics.batalDiperiksa}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {analytics.totalPasien}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {analytics.totalPasien > 0 
                          ? Math.round((analytics.sudahDiperiksa / analytics.totalPasien) * 100) 
                          : 0}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Breakdown</CardTitle>
                <CardDescription>Distribusi komponen biaya (dalam Rupiah)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.financialBreakdown.slice(0, 4)} // Exclude Grand Total from pie
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.financialBreakdown.slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString("id-ID")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Comparison</CardTitle>
                <CardDescription>Perbandingan total biaya vs grand total</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Total Biaya', value: analytics.totalBiaya },
                    { name: 'Grand Total', value: analytics.grandTotal },
                    { name: 'Hutang Penjamin', value: analytics.totalHutangPenjamin },
                    { name: 'Tanggungan RS', value: analytics.totalTanggunganRS },
                    { name: 'Harus Dibayar', value: analytics.totalHarusDiBayar }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString("id-ID")}`} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary Table</CardTitle>
              <CardDescription>Ringkasan komponen biaya lengkap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Komponen</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Jumlah (Rp)</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.financialBreakdown.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {item.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.value.toLocaleString("id-ID")}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Total Biaya</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {analytics.totalBiaya.toLocaleString("id-ID")}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ruangan" className="space-y-4">
          {/* Top 10 Ruangan dengan tabel yang lebih mudah dibaca */}
          <TopRoomsTable data={analytics.topRoomsChartData} />
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Harian (30 Hari Terakhir)</CardTitle>
                <CardDescription>Jumlah pasien dan biaya per hari</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="pasien" stroke="#8884d8" name="Pasien" />
                    <Line yAxisId="right" type="monotone" dataKey="biaya" stroke="#82ca9d" name="Biaya" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Bulanan</CardTitle>
                <CardDescription>Jumlah pasien dan biaya per bulan</CardDescription>
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
                    <Line yAxisId="left" type="monotone" dataKey="pasien" stroke="#8884d8" name="Pasien" />
                    <Line yAxisId="right" type="monotone" dataKey="biaya" stroke="#82ca9d" name="Biaya" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}