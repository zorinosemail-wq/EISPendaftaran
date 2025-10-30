import { NextRequest, NextResponse } from 'next/server';

// Server-Sent Events endpoint for real-time updates in Vercel
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time connection established' })}\n\n`));
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        const data = {
          type: 'update',
          timestamp: new Date().toISOString(),
          message: 'Monitoring data updated',
          // Add your actual monitoring data here
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }, 5000); // Send update every 5 seconds
      
      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}