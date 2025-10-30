"use client"

import { useState, useMemo, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  EyeIcon, 
  EyeOffIcon,
  DownloadIcon,
  FilterIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// Type definitions
export interface DataVerifikasiPelayanan {
  StatusValidasi: string
  StatusPeriksa: string
  TglPendaftaran: string
  NoPendaftaran: string
  NoRM: string
  NamaPasien: string
  JenisPasien: string
  InstalasiPerawatan: string
  RuanganPerawatan: string
  Kelas: string
  TglPelayanan: string | null
  NamaPelayanan: string | null
  JmlPelayanan: number | null
  Tarif: number | null
  TotalBiaya: number | null
  NoStruk: string | null
  NoBKM: string | null
  TglBKM: string | null
  TglVerifikasi: string | null
  RuanganTindakan: string | null
  InstalasiTindakan: string | null
  // New fields from API
  JmlHutangPenjamin: number | null
  JmlTanggunganRS: number | null
  JmlPembebasan: number | null
  JmlHarusDiBayar: number | null
  // Calculated fields
  TotalHutangPenjamin: number | null
  TotalTanggunganRS: number | null
  TotalPembebasan: number | null
  TotalHarusDiBayar: number | null
  GrandTotal: number | null
}

interface MonitoringTableProps {
  data: DataVerifikasiPelayanan[]
  loading?: boolean
}

interface Column {
  key: keyof DataVerifikasiPelayanan
  label: string
  width: number
  sortable?: boolean
  filterable?: boolean
  format?: (value: any) => string
  className?: string
}

const COLUMNS: Column[] = [
  { key: "StatusValidasi", label: "Status Validasi", width: 150, filterable: true },
  { key: "StatusPeriksa", label: "Status Periksa", width: 120, filterable: true },
  { key: "TglPendaftaran", label: "Tgl. Daftar", width: 120, sortable: true, format: (val) => val ? format(new Date(val), "dd/MM/yyyy", { locale: id }) : "-" },
  { key: "NoPendaftaran", label: "No. Daftar", width: 120 },
  { key: "NoRM", label: "No. RM", width: 100 },
  { key: "NamaPasien", label: "Nama Pasien", width: 200 },
  { key: "JenisPasien", label: "Jenis Pasien", width: 100, filterable: true },
  { key: "InstalasiPerawatan", label: "Instalasi", width: 150, filterable: true },
  { key: "RuanganPerawatan", label: "Ruangan", width: 200 },
  { key: "Kelas", label: "Kelas", width: 80, filterable: true },
  { key: "TglPelayanan", label: "Tgl. Pelayanan", width: 120, sortable: true, format: (val) => val ? format(new Date(val), "dd/MM/yyyy", { locale: id }) : "-" },
  { key: "NamaPelayanan", label: "Pelayanan", width: 250 },
  { key: "JmlPelayanan", label: "Jml", width: 80, format: (val) => val?.toLocaleString("id-ID") || "-" },
  { key: "Tarif", label: "Tarif", width: 120, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "TotalBiaya", label: "Total", width: 120, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "TotalHutangPenjamin", label: "Hutang Penjamin", width: 130, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "TotalTanggunganRS", label: "Tanggungan RS", width: 120, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "TotalPembebasan", label: "Pembebasan", width: 120, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "TotalHarusDiBayar", label: "Harus Dibayar", width: 130, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "GrandTotal", label: "Grand Total", width: 120, format: (val) => val ? `Rp ${val.toLocaleString("id-ID")}` : "-" },
  { key: "NoStruk", label: "No. Struk", width: 120 },
  { key: "NoBKM", label: "No. BKM", width: 120 },
  { key: "TglBKM", label: "Tgl. BKM", width: 120, sortable: true, format: (val) => val ? format(new Date(val), "dd/MM/yyyy", { locale: id }) : "-" },
  { key: "TglVerifikasi", label: "Tgl. Verifikasi", width: 130, sortable: true, format: (val) => val ? format(new Date(val), "dd/MM/yyyy", { locale: id }) : "-" },
  { key: "RuanganTindakan", label: "Ruangan Tindakan", width: 200 },
  { key: "InstalasiTindakan", label: "Instalasi Tindakan", width: 150 },
]

export function MonitoringTable({ data, loading = false }: MonitoringTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof DataVerifikasiPelayanan | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(["StatusValidasi", "StatusPeriksa", "TglPendaftaran", "NoPendaftaran", "NamaPasien", "JenisPasien", "InstalasiPerawatan", "TotalBiaya", "TotalHutangPenjamin", "TotalTanggunganRS", "TotalHarusDiBayar", "GrandTotal", "StatusPeriksa"])
  )
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => {
          const itemValue = item[key as keyof DataVerifikasiPelayanan]
          return String(itemValue).toLowerCase().includes(value.toLowerCase())
        })
      }
    })

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        let comparison = 0
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue)
        } else {
          comparison = (aValue as any) - (bValue as any)
        }
        
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return result
  }, [data, filters, sortColumn, sortDirection])

  // Virtualization
  const parentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      virtualizer.measureElement()
    }
  }, [])

  const virtualizer = useVirtualizer({
    count: filteredAndSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  })

  const handleSort = (column: keyof DataVerifikasiPelayanan) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleFilter = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey)
      } else {
        newSet.add(columnKey)
      }
      return newSet
    })
  }

  const visibleColumns = COLUMNS.filter(col => selectedColumns.has(col.key))

  const getStatusPeriksaBadge = (status: string) => {
    switch (status) {
      case "Y":
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Sudah Diperiksa</Badge>
      case "T":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ Belum Diperiksa</Badge>
      case "B":
        return <Badge variant="destructive">❌ Batal Pemeriksaan</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getStatusValidasiBadge = (status: string) => {
    if (!status || status.includes("Belum Validasi")) {
      return <Badge variant="destructive">❌ Belum Validasi Kasir</Badge>
    } else if (status.includes("Validasi Kasir")) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Validasi Kasir</Badge>
    } else if (status.includes("Verifikasi Keuangan")) {
      return <Badge variant="default" className="bg-green-100 text-green-800">✅ Verifikasi Keuangan</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const getRowClassName = (item: DataVerifikasiPelayanan) => {
    if (!item.NoBKM) {
      return "bg-red-50 hover:bg-red-100"
    } else if (item.NoBKM && !item.TglVerifikasi) {
      return "bg-yellow-50 hover:bg-yellow-100"
    } else if (item.TglVerifikasi) {
      return "bg-green-50 hover:bg-green-100"
    }
    return ""
  }

  // Calculate totals
  const totals = useMemo(() => {
    const uniquePatients = new Set(data.map(item => item.NoPendaftaran)).size
    const totalBiaya = data.reduce((sum, item) => sum + (item.TotalBiaya || 0), 0)
    const totalHutangPenjamin = data.reduce((sum, item) => sum + (item.TotalHutangPenjamin || 0), 0)
    const totalTanggunganRS = data.reduce((sum, item) => sum + (item.TotalTanggunganRS || 0), 0)
    const totalPembebasan = data.reduce((sum, item) => sum + (item.TotalPembebasan || 0), 0)
    const totalHarusDiBayar = data.reduce((sum, item) => sum + (item.TotalHarusDiBayar || 0), 0)
    const grandTotal = data.reduce((sum, item) => sum + (item.GrandTotal || 0), 0)
    const statusCounts = {
      sudah: new Set(data.filter(item => item.StatusPeriksa === "Y").map(item => item.NoPendaftaran)).size,
      belum: new Set(data.filter(item => item.StatusPeriksa === "T").map(item => item.NoPendaftaran)).size,
      batal: new Set(data.filter(item => item.StatusPeriksa === "B").map(item => item.NoPendaftaran)).size,
    }
    return { 
      uniquePatients, 
      totalBiaya, 
      totalHutangPenjamin,
      totalTanggunganRS,
      totalPembebasan,
      totalHarusDiBayar,
      grandTotal,
      statusCounts 
    }
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Monitoring Biaya</CardTitle>
            <CardDescription>
              Menampilkan {filteredAndSortedData.length.toLocaleString("id-ID")} dari {data.length.toLocaleString("id-ID")} data
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Pasien</p>
            <p className="text-2xl font-bold text-blue-800">{totals.uniquePatients.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Biaya</p>
            <p className="text-2xl font-bold text-green-800">Rp {totals.totalBiaya.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Hutang Penjamin</p>
            <p className="text-2xl font-bold text-purple-800">Rp {totals.totalHutangPenjamin.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Tanggungan RS</p>
            <p className="text-2xl font-bold text-orange-800">Rp {totals.totalTanggunganRS.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-lg">
            <p className="text-sm text-cyan-600 font-medium">Harus Dibayar</p>
            <p className="text-2xl font-bold text-cyan-800">Rp {totals.totalHarusDiBayar.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Grand Total</p>
            <p className="text-2xl font-bold text-indigo-800">Rp {totals.grandTotal.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* Column Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Kolom
          </Button>
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
              {COLUMNS.map(column => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={selectedColumns.has(column.key)}
                    onCheckedChange={() => toggleColumn(column.key)}
                  />
                  <label htmlFor={column.key} className="text-sm">
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleColumns.filter(col => col.filterable).map(column => (
                <div key={column.key} className="space-y-2">
                  <label className="text-sm font-medium">{column.label}</label>
                  <Input
                    placeholder={`Filter ${column.label}...`}
                    value={filters[column.key] || ""}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtual Table */}
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto border rounded-lg"
          style={{ contain: "strict" }}
        >
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-100 border-b">
              <div className="flex" style={{ width: "100%" }}>
                {visibleColumns.map(column => (
                  <div
                    key={column.key}
                    className="p-2 border-r font-medium text-sm bg-gray-100"
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleSort(column.key)}
                        >
                          {sortColumn === column.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Rows */}
            {virtualizer.getVirtualItems().map(virtualItem => {
              const item = filteredAndSortedData[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  className={cn(
                    "absolute top-0 left-0 flex border-b hover:bg-gray-50 transition-colors",
                    getRowClassName(item)
                  )}
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    width: "100%",
                  }}
                >
                  {visibleColumns.map(column => (
                    <div
                      key={column.key}
                      className="p-2 border-r text-sm"
                      style={{ width: column.width, minWidth: column.width }}
                    >
                      {column.key === "StatusPeriksa" ? (
                        getStatusPeriksaBadge(item[column.key] as string)
                      ) : column.key === "StatusValidasi" ? (
                        getStatusValidasiBadge(item[column.key] as string)
                      ) : (
                        <span className="truncate block">
                          {column.format ? column.format(item[column.key]) : (item[column.key] || "-")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}