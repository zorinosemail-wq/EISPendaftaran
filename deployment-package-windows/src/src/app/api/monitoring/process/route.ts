import { NextRequest, NextResponse } from 'next/server'

interface ProcessRequest {
  TglAwal: string
  TglAkhir: string
  KdInstalasi: string
}

interface DataVerifikasiPelayanan {
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

interface ProcessResponse {
  success: boolean
  data?: DataVerifikasiPelayanan[]
  error?: string
  progress?: {
    current: string
    percentage: number
    step: string
  }
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to split date range into chunks
function splitDateRange(startDate: Date, endDate: Date, chunkDays: number): Array<{ start: Date; end: Date }> {
  const ranges = []
  let currentStart = new Date(startDate)
  
  while (currentStart <= endDate) {
    const currentEnd = new Date(currentStart)
    currentEnd.setDate(currentEnd.getDate() + chunkDays - 1)
    
    if (currentEnd > endDate) {
      currentEnd.setTime(endDate.getTime())
    }
    
    ranges.push({
      start: new Date(currentStart),
      end: new Date(currentEnd)
    })
    
    currentStart = new Date(currentEnd)
    currentStart.setDate(currentStart.getDate() + 1)
  }
  
  return ranges
}

// Helper function to split array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export async function POST(request: NextRequest): Promise<NextResponse<ProcessResponse>> {
  try {
    const body: ProcessRequest = await request.json()
    const { TglAwal, TglAkhir, KdInstalasi } = body

    if (!TglAwal || !TglAkhir || !KdInstalasi) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: TglAwal, TglAkhir, KdInstalasi'
      }, { status: 400 })
    }

    const startDate = new Date(TglAwal)
    const endDate = new Date(TglAkhir)
    const batchDays = 10
    const batchSize = 2000
    const allDataGabung: DataVerifikasiPelayanan[] = []

    // Split date range into chunks
    const dateRanges = splitDateRange(startDate, endDate, batchDays)
    const totalSteps = dateRanges.length * 4 // 4 main steps per date range
    let currentStep = 0

    for (let rangeIndex = 0; rangeIndex < dateRanges.length; rangeIndex++) {
      const { start, end } = dateRanges[rangeIndex]
      const rangeStartStr = start.toISOString().split('T')[0]
      const rangeEndStr = end.toISOString().split('T')[0]
      
      // Update progress - Step 1
      currentStep++
      const progress1 = Math.round((currentStep / totalSteps) * 100)
      console.log(`[${progress1}%] Mengambil data pasien periode ${rangeStartStr} - ${rangeEndStr}...`)
      
      // Step 1: Load data pasien per batch tanggal
      const pasienResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/pasien`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TglAwal: rangeStartStr,
          TglAkhir: rangeEndStr,
          KdInstalasi
        })
      })

      if (!pasienResponse.ok) {
        throw new Error(`Failed to fetch patient data for range ${rangeIndex + 1}`)
      }

      const pasienData = await pasienResponse.json()
      
      if (!pasienData.success || !pasienData.items || pasienData.items.length === 0) {
        currentStep += 3 // Skip remaining steps for this range
        continue
      }

      // Update progress - Step 2
      currentStep++
      const progress2 = Math.round((currentStep / totalSteps) * 100)
      console.log(`[${progress2}%] Mengambil data biaya pelayanan untuk ${pasienData.items.length} pasien...`)

      // Step 2: Ambil data biaya pelayanan & obat per batch 100 NoPendaftaran
      const listNoPendaftaran = [...new Set(pasienData.items.map((item: any) => item.NoPendaftaran))]
      const batchBiaya: any[] = []

      const pendaftaranChunks = chunkArray(listNoPendaftaran, batchSize)
      const totalChunks = pendaftaranChunks.length
      
      for (let chunkIndex = 0; chunkIndex < pendaftaranChunks.length; chunkIndex++) {
        const subBatch = pendaftaranChunks[chunkIndex]
        const chunkProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100)
        console.log(`[${progress2}%] Processing biaya chunk ${chunkIndex + 1}/${totalChunks} (${chunkProgress}%)`)
        
        // Load data biaya tindakan
        const tindakanResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/tindakan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NoPendaftaran: subBatch })
        })

        if (tindakanResponse.ok) {
          const tindakanData = await tindakanResponse.json()
          if (tindakanData.success && tindakanData.items) {
            batchBiaya.push(...tindakanData.items)
          }
        }

        // Small delay to prevent overwhelming the API
        await delay(100)

        // Load data biaya obat
        const obatResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/obat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NoPendaftaran: subBatch })
        })

        if (obatResponse.ok) {
          const obatData = await obatResponse.json()
          if (obatData.success && obatData.items) {
            batchBiaya.push(...obatData.items)
          }
        }

        // Small delay to prevent overwhelming the API
        await delay(100)
      }

      // Update progress - Step 3
      currentStep++
      const progress3 = Math.round((currentStep / totalSteps) * 100)
      console.log(`[${progress3}%] Menggabungkan data pasien dan biaya...`)

      // Step 3: Gabungkan data pasien & biaya
      const gabung = pasienData.items.map((pasien: any) => {
        const biayaItems = batchBiaya.filter((biaya: any) => biaya.NoPendaftaran === pasien.NoPendaftaran)
        
        if (biayaItems.length === 0) {
          // Return pasien data without biaya
          return {
            StatusValidasi: "",
            StatusPeriksa: pasien.StatusPeriksa,
            TglPendaftaran: pasien.TglPendaftaran,
            NoPendaftaran: pasien.NoPendaftaran,
            NoRM: pasien.NoRM,
            NamaPasien: pasien.NamaPasien,
            JenisPasien: pasien.JenisPasien,
            InstalasiPerawatan: pasien.InstalasiPerawatan,
            RuanganPerawatan: pasien.RuanganPerawatan,
            Kelas: pasien.Kelas,
            TglPelayanan: null,
            NamaPelayanan: null,
            JmlPelayanan: null,
            Tarif: null,
            TotalBiaya: null,
            NoStruk: null,
            NoBKM: null,
            TglBKM: null,
            TglVerifikasi: null,
            RuanganTindakan: null,
            InstalasiTindakan: null,
            // New fields
            JmlHutangPenjamin: null,
            JmlTanggunganRS: null,
            JmlPembebasan: null,
            JmlHarusDiBayar: null,
            // Calculated fields
            TotalHutangPenjamin: null,
            TotalTanggunganRS: null,
            TotalPembebasan: null,
            TotalHarusDiBayar: null,
            GrandTotal: null
          }
        }

        // Return combined data for each biaya item
        return biayaItems.map((biaya: any) => {
          const jmlPelayanan = biaya.JmlPelayanan || 0
          const totalHutangPenjamin = (biaya.JmlHutangPenjamin || 0) * jmlPelayanan
          const totalTanggunganRS = (biaya.JmlTanggunganRS || 0) * jmlPelayanan
          const totalPembebasan = (biaya.JmlPembebasan || 0) * jmlPelayanan
          const totalHarusDiBayar = (biaya.JmlHarusDiBayar || 0) * jmlPelayanan
          const grandTotal = (biaya.TotalBiaya || 0) - (totalHutangPenjamin + totalTanggunganRS + totalPembebasan)

          return {
            StatusValidasi: "",
            StatusPeriksa: pasien.StatusPeriksa,
            TglPendaftaran: pasien.TglPendaftaran,
            NoPendaftaran: pasien.NoPendaftaran,
            NoRM: pasien.NoRM,
            NamaPasien: pasien.NamaPasien,
            JenisPasien: pasien.JenisPasien,
            InstalasiPerawatan: pasien.InstalasiPerawatan,
            RuanganPerawatan: pasien.RuanganPerawatan,
            Kelas: pasien.Kelas,
            TglPelayanan: biaya.TglPelayanan,
            NamaPelayanan: biaya.NamaPelayanan,
            JmlPelayanan: biaya.JmlPelayanan,
            Tarif: biaya.Tarif,
            TotalBiaya: biaya.TotalBiaya,
            NoStruk: biaya.NoStruk,
            NoBKM: biaya.NoBKM,
            TglBKM: null,
            TglVerifikasi: null,
            RuanganTindakan: biaya.RuanganTindakan,
            InstalasiTindakan: biaya.InstalasiTindakan,
            // New fields from API
            JmlHutangPenjamin: biaya.JmlHutangPenjamin,
            JmlTanggunganRS: biaya.JmlTanggunganRS,
            JmlPembebasan: biaya.JmlPembebasan,
            JmlHarusDiBayar: biaya.JmlHarusDiBayar,
            // Calculated fields
            TotalHutangPenjamin: totalHutangPenjamin,
            TotalTanggunganRS: totalTanggunganRS,
            TotalPembebasan: totalPembebasan,
            TotalHarusDiBayar: totalHarusDiBayar,
            GrandTotal: grandTotal
          }
        })
      }).flat()

      allDataGabung.push(...gabung)

      // Update progress - Step 4
      currentStep++
      const progress4 = Math.round((currentStep / totalSteps) * 100)
      console.log(`[${progress4}%] Memproses data verifikasi keuangan...`)

      // Step 4: Ambil NoBKM unik dan proses verifikasi
      const distinctNoBKM = [...new Set(gabung
        .filter(item => item.NoBKM)
        .map(item => item.NoBKM)
      )]

      if (distinctNoBKM.length > 0) {
        const dataBKM: any[] = []
        const bkmChunks = chunkArray(distinctNoBKM, batchSize)
        const totalBKMChunks = bkmChunks.length

        for (let bkmChunkIndex = 0; bkmChunkIndex < bkmChunks.length; bkmChunkIndex++) {
          const bkmChunk = bkmChunks[bkmChunkIndex]
          const bkmProgress = Math.round(((bkmChunkIndex + 1) / totalBKMChunks) * 100)
          console.log(`[${progress4}%] Processing verifikasi chunk ${bkmChunkIndex + 1}/${totalBKMChunks} (${bkmProgress}%)`)
          
          const verifikasiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/verifikasi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NoPendaftaran: bkmChunk }) // API expects NoPendaftaran but we send NoBKM
          })

          if (verifikasiResponse.ok) {
            const verifikasiData = await verifikasiResponse.json()
            if (verifikasiData.success && verifikasiData.items) {
              dataBKM.push(...verifikasiData.items)
            }
          }

          // Small delay to prevent overwhelming the API
          await delay(100)
        }

        // Step 5: Update TglBKM & TglVerifikasiKeuangan di data gabungan
        const dictBKM = new Map(dataBKM.map(item => [item.NoBKM, item]))

        for (const item of gabung) {
          if (item.NoBKM && dictBKM.has(item.NoBKM)) {
            const bkmMatch = dictBKM.get(item.NoBKM)!
            item.TglBKM = bkmMatch.TglBKM
            item.TglVerifikasi = bkmMatch.TglVerifikasiKeuangan
          }

          // Set status validasi
          if (!item.NoBKM) {
            item.StatusValidasi = "❌ Belum Validasi Kasir"
          } else if (item.NoBKM && !item.TglVerifikasi) {
            item.StatusValidasi = "⚠️ Validasi Kasir"
          } else {
            item.StatusValidasi = "✅ Verifikasi Keuangan"
          }
        }
      }

      console.log(`Range ${rangeIndex + 1}/${dateRanges.length} completed. Total records so far: ${allDataGabung.length}`)
    }

    console.log(`[100%] Proses selesai! Total data: ${allDataGabung.length} records`)

    return NextResponse.json({
      success: true,
      data: allDataGabung
    })

  } catch (error) {
    console.error('Process API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}