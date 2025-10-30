"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MonitoringForm } from "@/components/monitoring/monitoring-form"
import { MonitoringTable, DataVerifikasiPelayanan } from "@/components/monitoring/monitoring-table"
import { MonitoringDashboardV2 } from "@/components/monitoring/monitoring-dashboard-v2"
import { BatchProgress } from "@/components/BatchProgress"
import { TopRoomsTable } from "@/components/TopRoomsTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3Icon, TableIcon, ActivityIcon, AlertCircleIcon, LogOutIcon, UserIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface FormData {
  tanggalAwal: Date
  tanggalAkhir: Date
  instalasi: string
}

export default function Home() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DataVerifikasiPelayanan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [processedRecords, setProcessedRecords] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    setHasSearched(true)
    setProgress(0)
    setCurrentBatch(0)
    setTotalBatches(0)
    setCurrentStep("")
    setProcessedRecords(0)
    setTotalRecords(0)
    setData([])

    try {
      // Try streaming API first
      try {
        const response = await fetch('/api/monitoring/process-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            TglAwal: formData.tanggalAwal.toISOString().split('T')[0],
            TglAkhir: formData.tanggalAkhir.toISOString().split('T')[0],
            KdInstalasi: formData.instalasi
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split by newlines and process complete messages
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep the last incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim()
                if (jsonStr && jsonStr !== '') {
                  const data = JSON.parse(jsonStr)
                  
                  if (data.type === 'progress') {
                    setProgress(data.progress)
                    setCurrentBatch(data.currentBatch)
                    setTotalBatches(data.totalBatches)
                    setCurrentStep(data.currentStep)
                    setProcessedRecords(data.processedRecords)
                    setTotalRecords(data.totalRecords)
                  } else if (data.type === 'complete') {
                    setData(data.data || [])
                    setProgress(100)
                    setCurrentStep("Proses selesai!")
                    setProcessedRecords(data.totalRecords)
                    setTotalRecords(data.totalRecords)
                  } else if (data.type === 'error') {
                    throw new Error(data.error)
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
                console.error('Problematic line:', line)
                // Continue processing other lines even if one fails
              }
            }
          }
        }

        // Process any remaining data in buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.slice(6).trim()
            if (jsonStr && jsonStr !== '') {
              const data = JSON.parse(jsonStr)
              
              if (data.type === 'progress') {
                setProgress(data.progress)
                setCurrentBatch(data.currentBatch)
                setTotalBatches(data.totalBatches)
                setCurrentStep(data.currentStep)
                setProcessedRecords(data.processedRecords)
                setTotalRecords(data.totalRecords)
              } else if (data.type === 'complete') {
                setData(data.data || [])
                setProgress(100)
                setCurrentStep("Proses selesai!")
                setProcessedRecords(data.totalRecords)
                setTotalRecords(data.totalRecords)
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            }
          } catch (e) {
            console.error('Error parsing final SSE data:', e)
            console.error('Problematic buffer:', buffer)
          }
        }

      } catch (streamError) {
        console.warn('Streaming API failed, falling back to regular API:', streamError)
        
        // Fallback to regular API
        setCurrentStep("Menggunakan metode standar...")
        setProgress(25)

        const response = await fetch('/api/monitoring/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            TglAwal: formData.tanggalAwal.toISOString().split('T')[0],
            TglAkhir: formData.tanggalAkhir.toISOString().split('T')[0],
            KdInstalasi: formData.instalasi
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data || [])
          setProgress(100)
          setCurrentStep("Proses selesai!")
          setProcessedRecords(result.data?.length || 0)
          setTotalRecords(result.data?.length || 0)
        } else {
          throw new Error(result.error || 'Failed to process data')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error processing monitoring data:', err)
    } finally {
      setLoading(false)
    }
  }

  const instalasiLabels: Record<string, string> = {
    "01": "Instalasi Gawat Darurat",
    "02": "Instalasi Rawat Jalan", 
    "03": "Instalasi Rawat Inap"
  }

  // Calculate unique statistics
  const uniqueStats = useMemo(() => {
    if (!data.length) return { totalPasien: 0, sudahDiperiksa: 0, belumDiperiksa: 0, batalDiperiksa: 0 }
    
    const uniquePatients = new Map<string, DataVerifikasiPelayanan>()
    data.forEach(item => {
      if (!uniquePatients.has(item.NoPendaftaran)) {
        uniquePatients.set(item.NoPendaftaran, item)
      }
    })
    
    const uniqueData = Array.from(uniquePatients.values())
    const sudahDiperiksa = uniqueData.filter(item => item.StatusPeriksa === "Y").length
    const belumDiperiksa = uniqueData.filter(item => item.StatusPeriksa === "T").length
    const batalDiperiksa = uniqueData.filter(item => item.StatusPeriksa === "B").length
    
    return {
      totalPasien: uniqueData.length,
      sudahDiperiksa,
      belumDiperiksa,
      batalDiperiksa
    }
  }, [data])

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Info and Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sistem Monitoring Biaya Rumah Sakit
            </h1>
            <p className="text-lg text-gray-600">
              Analisis keuangan dan kunjungan pasien berdasarkan status periksa dan ruangan tindakan
            </p>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Selamat datang,</p>
              <p className="font-medium text-gray-900">{user.namaLengkap}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="mb-8">
          <MonitoringForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Batch Progress */}
        <BatchProgress 
          isProcessing={loading}
          progress={progress}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          currentStep={currentStep}
          processedRecords={processedRecords}
          totalRecords={totalRecords}
          error={error}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Results */}
        {hasSearched && !loading && (
          <>
            {data.length > 0 ? (
              <div className="space-y-8">
                {/* Summary Info - Updated dengan data unik */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ActivityIcon className="h-5 w-5" />
                      Ringkasan Data (Pasien Unik)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {uniqueStats.totalPasien.toLocaleString("id-ID")}
                        </div>
                        <div className="text-sm text-gray-600">Total Pasien</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.length.toLocaleString("id-ID")}
                        </div>
                        <div className="text-sm text-gray-600">Total Transaksi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          Rp {data.reduce((sum, item) => sum + (item.TotalBiaya || 0), 0).toLocaleString("id-ID")}
                        </div>
                        <div className="text-sm text-gray-600">Total Biaya</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {uniqueStats.sudahDiperiksa}
                        </div>
                        <div className="text-sm text-gray-600">Sudah Diperiksa</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {uniqueStats.belumDiperiksa}
                        </div>
                        <div className="text-sm text-gray-600">Belum Diperiksa</div>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          {uniqueStats.batalDiperiksa}
                        </div>
                        <div className="text-sm text-red-600">Batal Diperiksa</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          Rp {uniqueStats.totalPasien > 0 ? Math.round(data.reduce((sum, item) => sum + (item.TotalBiaya || 0), 0) / uniqueStats.totalPasien).toLocaleString("id-ID") : 0}
                        </div>
                        <div className="text-sm text-blue-600">Rata-rata Biaya/Pasien</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {uniqueStats.totalPasien > 0 ? Math.round((uniqueStats.sudahDiperiksa / uniqueStats.totalPasien) * 100) : 0}%
                        </div>
                        <div className="text-sm text-green-600">Completion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                      <BarChart3Icon className="h-4 w-4" />
                      Dashboard Analisa Status Periksa
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-6">
                    <MonitoringDashboardV2 data={data} loading={loading} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-500">
                    <TableIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Tidak Ada Data</h3>
                    <p>Tidak ada data yang ditemukan untuk periode dan instalasi yang dipilih.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 Sistem Monitoring Biaya Rumah Sakit. Dikembangkan dengan Next.js 15 & TypeScript.</p>
        </footer>
      </div>
    </div>
  )
}