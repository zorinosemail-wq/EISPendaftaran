"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"

interface RealtimeProgressProps {
  isProcessing: boolean
  onComplete?: () => void
}

export function RealtimeProgress({ isProcessing, onComplete }: RealtimeProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("Menunggu proses...")
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (isProcessing) {
      setProgress(0)
      setCurrentStep("Memulai proses pengambilan data...")
      setLogs([])
      
      // Simulate progress updates (dalam real implementasi, ini akan dari WebSocket atau polling)
      const progressSteps = [
        { step: "Menghubungkan ke server...", progress: 10 },
        { step: "Mendapatkan token autentikasi...", progress: 15 },
        { step: "Mengambil data pasien...", progress: 30 },
        { step: "Memproses data biaya pelayanan...", progress: 50 },
        { step: "Mengambil data obat dan tindakan...", progress: 70 },
        { step: "Memproses data verifikasi keuangan...", progress: 85 },
        { step: "Menggabungkan semua data...", progress: 95 },
        { step: "Menyiapkan laporan...", progress: 99 },
        { step: "Proses selesai!", progress: 100 }
      ]

      let currentStepIndex = 0
      const interval = setInterval(() => {
        if (currentStepIndex < progressSteps.length) {
          const { step, progress: newProgress } = progressSteps[currentStepIndex]
          setCurrentStep(step)
          setProgress(newProgress)
          setLogs(prev => [...prev, `[${newProgress}%] ${step}`])
          currentStepIndex++
        } else {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 500)
          }
        }
      }, 2000) // Update setiap 2 detik

      return () => clearInterval(interval)
    } else {
      if (progress === 100) {
        setTimeout(() => {
          setProgress(0)
          setCurrentStep("Menunggu proses...")
          setLogs([])
        }, 3000)
      }
    }
  }, [isProcessing, onComplete])

  if (!isProcessing && progress === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {progress < 100 ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">{currentStep}</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">{progress}% Complete</p>
            </div>
          </div>
          
          {/* Progress Logs */}
          {logs.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {logs.slice(-5).map((log, index) => (
                  <div key={index} className="text-gray-600">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}