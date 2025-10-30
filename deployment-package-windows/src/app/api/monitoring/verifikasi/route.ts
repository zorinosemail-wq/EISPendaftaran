import { NextRequest, NextResponse } from 'next/server'

interface VerifikasiRequest {
  NoPendaftaran: string[] // Actually NoBKM
}

interface VerifikasiItem {
  NoBKM: string
  TglBKM: string
  TglVerifikasiKeuangan: string
}

interface VerifikasiResponse {
  success: boolean
  periode?: string
  total?: number
  items?: VerifikasiItem[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifikasiResponse>> {
  try {
    const body: VerifikasiRequest = await request.json()
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

    // Fetch data verifikasi
    const response = await fetch('https://api-rsudbudhiasih.jakarta.go.id:8080/MedisServices/api/MonitoringBiaya/GetVerif', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        NoPendaftaran // This is actually NoBKM
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch verifikasi data: ${response.status} ${response.statusText}`)
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
        error: 'Failed to get verifikasi data from external API'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Verifikasi API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}