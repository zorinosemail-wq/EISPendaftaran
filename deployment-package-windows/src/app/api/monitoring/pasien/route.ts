import { NextRequest, NextResponse } from 'next/server'

interface PasienRequest {
  TglAwal: string
  TglAkhir: string
  KdInstalasi: string
}

interface PasienItem {
  StatusValidasi: string | null
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
}

interface PasienResponse {
  success: boolean
  periode?: string
  total?: number
  items?: PasienItem[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<PasienResponse>> {
  try {
    const body: PasienRequest = await request.json()
    const { TglAwal, TglAkhir, KdInstalasi } = body

    if (!TglAwal || !TglAkhir || !KdInstalasi) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: TglAwal, TglAkhir, KdInstalasi'
      }, { status: 400 })
    }

    // Get token first
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monitoring/login`, {
      method: 'POST',
    })

    if (!loginResponse.ok) {
      throw new Error('Failed to get authentication token')
    }

    const loginData = await loginResponse.json()
    
    if (!loginData.success || !loginData.token) {
      throw new Error('Authentication failed')
    }

    // Fetch data pasien
    const response = await fetch('https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/MonitoringBiaya/GetDataPasien', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        TglAwal,
        TglAkhir,
        KdInstalasi
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch patient data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        periode: data.periode,
        total: data.total,
        items: data.items || []
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to get patient data from external API'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Pasien API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}