import { NextRequest, NextResponse } from 'next/server'

interface LoginRequest {
  username: string
  password: string
}

interface ExternalLoginResponse {
  success: boolean
  message: string
  total: number
  items: Array<{
    IdPegawai: string
    Username: string
    Password: string
    nourut: string
    kdruangan: string
    namaruangan: string
    namalengkap: string
    namakomputer: string
    KdJenisPegawai: string
    KdKategoryUser: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username dan password harus diisi'
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

    // Call external API
    const response = await fetch('http://192.168.12.218:8080/MedisServices/api/utkLogin/MauLogin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ngaran: username,
        pasprot: password
      })
    })

 

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ExternalLoginResponse = await response.json()

    if (data.success && data.items && data.items.length > 0) {
      const user = data.items[0]
      
      // Create session token
      const token = Buffer.from(JSON.stringify({
        id: user.IdPegawai,
        username: username,
        namaLengkap: user.namalengkap,
        ruangan: user.namaruangan,
        kdruangan: user.kdruangan
      })).toString('base64')

      // Create HTTP-only cookie
      const serialized = JSON.stringify({
        user: {
          id: user.IdPegawai,
          username: username,
          namaLengkap: user.namalengkap,
          ruangan: user.namaruangan,
          kdruangan: user.kdruangan
        },
        token
      })

      const loginResponse = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        user: {
          id: user.IdPegawai,
          username: username,
          namaLengkap: user.namalengkap,
          ruangan: user.namaruangan,
          kdruangan: user.kdruangan
        }
      })

      loginResponse.cookies.set('session', serialized, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return loginResponse
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Login gagal'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}