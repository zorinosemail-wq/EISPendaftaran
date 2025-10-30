import { NextRequest } from 'next/server'

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

// Helper function to send progress update
function sendProgress(
  controller: ReadableStreamDefaultController,
  progress: number,
  currentBatch: number,
  totalBatches: number,
  currentStep: string,
  processedRecords: number,
  totalRecords: number
) {
  try {
    const data = {
      type: 'progress',
      progress,
      currentBatch,
      totalBatches,
      currentStep,
      processedRecords,
      totalRecords,
      timestamp: new Date().toISOString()
    }
    
    const jsonStr = JSON.stringify(data)
    controller.enqueue(`data: ${jsonStr}\n\n`)
  } catch (error) {
    console.error('Error sending progress:', error)
  }
}

// Helper function to send completion
function sendCompletion(
  controller: ReadableStreamDefaultController,
  data: DataVerifikasiPelayanan[]
) {
  try {
    const completion = {
      type: 'complete',
      data,
      totalRecords: data.length,
      timestamp: new Date().toISOString()
    }
    
    const jsonStr = JSON.stringify(completion)
    controller.enqueue(`data: ${jsonStr}\n\n`)
  } catch (error) {
    console.error('Error sending completion:', error)
  }
}

// Helper function to send error
function sendError(
  controller: ReadableStreamDefaultController,
  error: string
) {
  try {
    const errorData = {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    }
    
    const jsonStr = JSON.stringify(errorData)
    controller.enqueue(`data: ${jsonStr}\n\n`)
  } catch (err) {
    console.error('Error sending error:', err)
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body: ProcessRequest = await request.json()
        const { TglAwal, TglAkhir, KdInstalasi } = body

        if (!TglAwal || !TglAkhir || !KdInstalasi) {
          sendError(controller, 'Missing required parameters: TglAwal, TglAkhir, KdInstalasi')
          controller.close()
          return
        }

        const startDate = new Date(TglAwal)
        const endDate = new Date(TglAkhir)
        const batchDays = 10
        const batchSize = 2000
        const allDataGabung: DataVerifikasiPelayanan[] = []

        // Split date range into chunks
        const dateRanges = splitDateRange(startDate, endDate, batchDays)
        const totalBatches = dateRanges.length
        let processedRecords = 0

        // Initial progress
        sendProgress(
          controller,
          0,
          0,
          totalBatches,
          "Memulai proses pengambilan data...",
          0,
          0
        )

        for (let rangeIndex = 0; rangeIndex < dateRanges.length; rangeIndex++) {
          const { start, end } = dateRanges[rangeIndex]
          const rangeStartStr = start.toISOString().split('T')[0]
          const rangeEndStr = end.toISOString().split('T')[0]
          
          // Update progress - Step 1
          sendProgress(
            controller,
            Math.round((rangeIndex / totalBatches) * 100),
            rangeIndex + 1,
            totalBatches,
            `Mengambil data pasien periode ${rangeStartStr} - ${rangeEndStr}...`,
            processedRecords,
            0
          )
          
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
            sendProgress(
              controller,
              Math.round(((rangeIndex + 1) / totalBatches) * 100),
              rangeIndex + 1,
              totalBatches,
              `Tidak ada data untuk periode ${rangeStartStr} - ${rangeEndStr}`,
              processedRecords,
              0
            )
            continue
          }

          // Update progress - Step 2
          sendProgress(
            controller,
            Math.round(((rangeIndex + 0.25) / totalBatches) * 100),
            rangeIndex + 1,
            totalBatches,
            `Mengambil data biaya pelayanan untuk ${pasienData.items.length} pasien...`,
            processedRecords,
            pasienData.items.length
          )

          // Step 2: Ambil data biaya pelayanan & obat per batch 100 NoPendaftaran
          const listNoPendaftaran = [...new Set(pasienData.items.map((item: any) => item.NoPendaftaran))]
          const batchBiaya: any[] = []

          const pendaftaranChunks = chunkArray(listNoPendaftaran, batchSize)
          const totalChunks = pendaftaranChunks.length
          
          for (let chunkIndex = 0; chunkIndex < pendaftaranChunks.length; chunkIndex++) {
            const subBatch = pendaftaranChunks[chunkIndex]
            
            sendProgress(
              controller,
              Math.round(((rangeIndex + 0.25 + (chunkIndex / totalChunks) * 0.5) / totalBatches) * 100),
              rangeIndex + 1,
              totalBatches,
              `Memproses biaya chunk ${chunkIndex + 1}/${totalChunks}...`,
              processedRecords,
              pasienData.items.length
            )
            
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
          sendProgress(
            controller,
            Math.round(((rangeIndex + 0.75) / totalBatches) * 100),
            rangeIndex + 1,
            totalBatches,
            `Menggabungkan data pasien dan biaya...`,
            processedRecords,
            pasienData.items.length
          )

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
          processedRecords += gabung.length

          // Update progress - Step 4
          sendProgress(
            controller,
            Math.round(((rangeIndex + 0.85) / totalBatches) * 100),
            rangeIndex + 1,
            totalBatches,
            `Memproses data verifikasi keuangan...`,
            processedRecords,
            pasienData.items.length
          )

          // Step 4: Ambil NoBKM unik dan proses verifikasi
          const distinctNoBKM = [...new Set(gabung
            .filter(item => item.NoBKM)
            .map(item => item.NoBKM)
          )]

          if (distinctNoBKM.length > 0) {
            const dataBKM: any[] = []
            const bkmChunks = chunkArray(distinctNoBKM, batchSize)

            for (let bkmChunkIndex = 0; bkmChunkIndex < bkmChunks.length; bkmChunkIndex++) {
              const bkmChunk = bkmChunks[bkmChunkIndex]
              
              sendProgress(
                controller,
                Math.round(((rangeIndex + 0.85 + (bkmChunkIndex / bkmChunks.length) * 0.15) / totalBatches) * 100),
                rangeIndex + 1,
                totalBatches,
                `Memproses verifikasi chunk ${bkmChunkIndex + 1}/${bkmChunks.length}...`,
                processedRecords,
                pasienData.items.length
              )
              
              const verifikasiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/verifikasi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ NoPendaftaran: bkmChunk })
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
        }

        // Final progress
        sendProgress(
          controller,
          95,
          totalBatches,
          totalBatches,
          "Menyelesaikan proses...",
          processedRecords,
          processedRecords
        )

        // Small delay before completion
        await delay(500)

        // Send completion
        sendCompletion(controller, allDataGabung)
        controller.close()

      } catch (error) {
        console.error('Process Stream API Error:', error)
        sendError(
          controller,
          error instanceof Error ? error.message : 'Unknown error occurred'
        )
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}