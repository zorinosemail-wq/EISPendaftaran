import { NextRequest, NextResponse } from 'next/server'

interface LoginResponse {
  success: boolean
  token?: string
  expires?: string
  error?: string
}

export async function POST(): Promise<NextResponse<LoginResponse>> {
  try {
    const response = await fetch('http://192.168.12.218:8080/MedisServices/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '12345'
      })
    })

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.success && data.token) {
      return NextResponse.json({
        success: true,
        token: data.token,
        expires: data.expires
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid login response'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}