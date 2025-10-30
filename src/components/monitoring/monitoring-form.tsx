"use client"

import { useState } from "react"
import { CalendarIcon, SearchIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MonitoringFormProps {
  onSubmit: (data: FormData) => void
  loading?: boolean
}

interface FormData {
  tanggalAwal: Date
  tanggalAkhir: Date
  instalasi: string
}

const instalasiOptions = [
  { value: "01", label: "Instalasi Gawat Darurat" },
  { value: "02", label: "Instalasi Rawat Jalan" },
  { value: "03", label: "Instalasi Rawat Inap" },
]

export function MonitoringForm({ onSubmit, loading = false }: MonitoringFormProps) {
  const [tanggalAwal, setTanggalAwal] = useState<Date>()
  const [tanggalAkhir, setTanggalAkhir] = useState<Date>()
  const [instalasi, setInstalasi] = useState<string>("")

  const handleSubmit = () => {
    if (!tanggalAwal || !tanggalAkhir || !instalasi) {
      alert("Mohon lengkapi semua field")
      return
    }

    if (tanggalAwal > tanggalAkhir) {
      alert("Tanggal awal tidak boleh lebih besar dari tanggal akhir")
      return
    }

    onSubmit({
      tanggalAwal,
      tanggalAkhir,
      instalasi,
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SearchIcon className="h-5 w-5" />
          Monitoring Biaya Rumah Sakit
        </CardTitle>
        <CardDescription>
          Pilih periode tanggal dan instalasi untuk melihat laporan monitoring biaya pelayanan pasien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tanggal Awal */}
          <div className="space-y-2">
            <Label htmlFor="tanggal-awal">Tanggal Awal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tanggalAwal && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggalAwal ? (
                    format(tanggalAwal, "dd-MM-yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal awal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tanggalAwal}
                  onSelect={setTanggalAwal}
                  initialFocus
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tanggal Akhir */}
          <div className="space-y-2">
            <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tanggalAkhir && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggalAkhir ? (
                    format(tanggalAkhir, "dd-MM-yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal akhir</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tanggalAkhir}
                  onSelect={setTanggalAkhir}
                  initialFocus
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Instalasi */}
        <div className="space-y-2">
          <Label htmlFor="instalasi">Instalasi</Label>
          <Select value={instalasi} onValueChange={setInstalasi} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih instalasi" />
            </SelectTrigger>
            <SelectContent>
              {instalasiOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={loading || !tanggalAwal || !tanggalAkhir || !instalasi}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Memproses Data...
            </>
          ) : (
            <>
              <SearchIcon className="mr-2 h-4 w-4" />
              Tampilkan Laporan
            </>
          )}
        </Button>

        {/* Info */}
        {tanggalAwal && tanggalAkhir && instalasi && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Periode:</strong> {format(tanggalAwal, "dd MMMM yyyy", { locale: id })} s.d{" "}
              {format(tanggalAkhir, "dd MMMM yyyy", { locale: id })}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Instalasi:</strong> {instalasiOptions.find(opt => opt.value === instalasi)?.label}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}