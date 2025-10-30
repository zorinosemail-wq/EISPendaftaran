import { NextRequest, NextResponse } from 'next/server';

// For Vercel, we'll use a different approach for Socket.IO
// Since Vercel doesn't support persistent WebSocket connections in serverless functions,
// we'll provide a fallback implementation

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.IO is not fully supported in Vercel serverless environment. Real-time features will be limited.',
    alternative: 'Consider using Server-Sent Events or polling for real-time updates in production.'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.IO endpoint for Vercel deployment',
    status: 'limited'
  });
}