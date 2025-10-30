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

    // Call external API
    const response = await fetch('https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/utkLogin/MauLogin', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NjE4MDg0MDksImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3QvbWVkaXNzZXJ2aWNlcyIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3QvbWVkaXNzZXJ2aWNlcyJ9.-5CyHjFSWpnkx_iuFbhmwor9jEQ8l7Q3ue84kuyPXes',
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