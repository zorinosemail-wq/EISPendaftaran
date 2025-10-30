import { NextRequest, NextResponse } from 'next/server'

interface ObatRequest {
  NoPendaftaran: string[]
}

interface ObatItem {
  NoPendaftaran: string
  NamaPelayanan: string
  JmlPelayanan: number
  TglPelayanan: string
  NoStruk: string | null
  NoBKM: string | null
  Tarif: number
  TotalBiaya: number
  RuanganTindakan: string
  InstalasiTindakan: string
  KdPelayananRs: string | null
}

interface ObatResponse {
  success: boolean
  periode?: string
  total?: number
  items?: ObatItem[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ObatResponse>> {
  try {
    const body: ObatRequest = await request.json()
    const { NoPendaftaran } = body

    if (!NoPendaftaran || !Array.isArray(NoPendaftaran) || NoPendaftaran.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid NoPendaftaran parameter'
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

    // Fetch data biaya obat
    const response = await fetch('https://api-rsudbudhiasih.jakarta.go.id:8080/MedisServices/api/MonitoringBiaya/GetBiayaObat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        NoPendaftaran
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch obat data: ${response.status} ${response.statusText}`)
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
        error: 'Failed to get obat data from external API'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Obat API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}