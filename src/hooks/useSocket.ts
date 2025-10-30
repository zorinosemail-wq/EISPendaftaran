// Socket.IO client for development, fallback for production
'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  text: string;
  senderId: string;
  timestamp: string;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProduction, setIsProduction] = useState(false);
  const socketRef = useRef<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Check if we're in production (Vercel)
    setIsProduction(process.env.NODE_ENV === 'production');

    if (process.env.NODE_ENV === 'production') {
      // In production (Vercel), use Server-Sent Events
      connectSSE();
    } else {
      // In development, use Socket.IO
      connectSocketIO();
    }

    return () => {
      cleanup();
    };
  }, []);

  const connectSocketIO = async () => {
    try {
      const { io } = await import('socket.io-client');
      
      socketRef.current = io('/', {
        path: '/api/socketio',
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      socketRef.current.on('message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

    } catch (error) {
      console.error('Socket.IO connection failed:', error);
      setIsProduction(true); // Fallback to SSE
      connectSSE();
    }
  };

  const connectSSE = () => {
    try {
      const eventSource = new EventSource('/api/realtime');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Connected to SSE endpoint');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            text: data.message || 'Update received',
            senderId: 'system',
            timestamp: data.timestamp || new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('SSE connection failed:', error);
      setIsConnected(false);
    }
  };

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const sendMessage = (text: string) => {
    if (isProduction) {
      // In production, simulate message sending
      setMessages(prev => [...prev, {
        text: `Message sent: ${text}`,
        senderId: 'user',
        timestamp: new Date().toISOString()
      }]);
    } else if (socketRef.current) {
      // In development, use Socket.IO
      socketRef.current.emit('message', { text, senderId: 'user' });
    }
  };

  return {
    isConnected,
    messages,
    sendMessage,
    isProduction
  };
};