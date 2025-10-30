"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProgressIndicatorProps {
  current: string
  percentage: number
  showPercentage?: boolean
}

export function ProgressIndicator({ 
  current, 
  percentage, 
  showPercentage = true 
}: ProgressIndicatorProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{current}</p>
            <Progress value={percentage} className="w-full" />
            {showPercentage && (
              <p className="text-xs text-muted-foreground">{percentage}% Complete</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}