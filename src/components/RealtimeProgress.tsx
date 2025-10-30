"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, FileCheck, Activity } from "lucide-react";

interface RealtimeProgressProps {
  isComplete: boolean;
  error?: string | null;
  onProgressComplete?: () => void;
}

export function RealtimeProgress({ isComplete, error, onProgressComplete }: RealtimeProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { icon: Database, label: "Menghubungkan ke database", duration: 800 },
    { icon: Activity, label: "Mengambil data pasien", duration: 2000 },
    { icon: FileCheck, label: "Memproses data", duration: 1200 },
    { icon: FileCheck, label: "Menghitung statistik", duration: 1000 },
    { icon: FileCheck, label: "Menyiapkan tampilan", duration: 800 }
  ];

  useEffect(() => {
    // Reset ketika memulai proses baru
    if (!isComplete && !isProcessing) {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isComplete, isProcessing]);

  useEffect(() => {
    if (!isProcessing || isComplete) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        
        // Update step berdasarkan progress
        const stepIndex = Math.min(Math.floor((newProgress / 100) * steps.length), steps.length - 1);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
          setCurrentStep(stepIndex);
        }
        
        // Complete hanya jika benar-benar selesai
        if (newProgress >= 100 && isComplete) {
          setIsProcessing(false);
          if (onProgressComplete) {
            setTimeout(onProgressComplete, 300);
          }
          return 100;
        }
        
        // Jika belum complete, jangan capai 100%
        if (newProgress >= 95 && !isComplete) {
          return 95; // Maksimal 95% sebelum data benar-benar selesai
        }
        
        return newProgress;
      });
    }, 50); // Update lebih sering untuk kelancaran

    return () => clearInterval(interval);
  }, [isProcessing, isComplete, currentStep, onProgressComplete]);

  // Ketika data benar-benar selesai, langsung ke 100%
  useEffect(() => {
    if (isComplete && isProcessing) {
      setProgress(100);
      setCurrentStep(steps.length - 1);
      setTimeout(() => {
        setIsProcessing(false);
        if (onProgressComplete) onProgressComplete();
      }, 500);
    }
  }, [isComplete, isProcessing, onProgressComplete]);

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const CurrentIcon = steps[currentStep]?.icon || Activity;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
          Memuat Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <CurrentIcon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {steps[currentStep]?.label || "Memproses..."}
          </span>
          {isProcessing && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {!isComplete && "Mohon tunggu, sedang mengambil data..."}
          {isComplete && "Data berhasil dimuat!"}
        </div>
      </CardContent>
    </Card>
  );
}