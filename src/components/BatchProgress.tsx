"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, FileCheck, Activity, Users, CheckCircle } from "lucide-react";

interface BatchProgressProps {
  isProcessing: boolean;
  progress?: number;
  currentBatch?: number;
  totalBatches?: number;
  currentStep?: string;
  processedRecords?: number;
  totalRecords?: number;
  error?: string | null;
}

export function BatchProgress({ 
  isProcessing, 
  progress = 0,
  currentBatch = 0,
  totalBatches = 0,
  currentStep = "",
  processedRecords = 0,
  totalRecords = 0,
  error 
}: BatchProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, isProcessing]);

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
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

  if (!isProcessing && progress === 0) {
    return null;
  }

  const getStepIcon = () => {
    if (currentStep.toLowerCase().includes('database') || currentStep.toLowerCase().includes('koneksi')) {
      return Database;
    }
    if (currentStep.toLowerCase().includes('proses') || currentStep.toLowerCase().includes('process')) {
      return Activity;
    }
    if (currentStep.toLowerCase().includes('selesai') || currentStep.toLowerCase().includes('complete')) {
      return CheckCircle;
    }
    return Users;
  };

  const CurrentIcon = getStepIcon();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
            Memproses Data
          </div>
          {isProcessing && (
            <Badge variant="secondary" className="animate-pulse">
              Sedang Berjalan
            </Badge>
          )}
          {!isProcessing && progress === 100 && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Selesai
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar Utama */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress Keseluruhan</span>
            <span className="font-medium">{Math.round(animatedProgress)}%</span>
          </div>
          <Progress value={animatedProgress} className="h-3" />
        </div>

        {/* Informasi Batch */}
        {totalBatches > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Batch:</span>
              <span className="font-medium">{currentBatch}/{totalBatches}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Record:</span>
              <span className="font-medium">{processedRecords.toLocaleString('id-ID')}/{totalRecords.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
          <CurrentIcon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground flex-1">{currentStep || "Memproses..."}</span>
          {isProcessing && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="text-xs text-muted-foreground text-center">
          {isProcessing && "Mohon tunggu, sedang memproses data..."}
          {!isProcessing && progress === 100 && "✅ Data berhasil diproses!"}
          {!isProcessing && progress > 0 && progress < 100 && "⏸️ Proses dijeda"}
        </div>
      </CardContent>
    </Card>
  );
}