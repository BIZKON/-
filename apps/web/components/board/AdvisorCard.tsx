"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface AdvisorCardProps {
  personaId: string;
  personaName: string;
  advice: string;
  keyPoints: string[];
  riskAssessment: string;
  confidence: string;
  isLoading?: boolean;
}

const personaColors: Record<string, string> = {
  tinkoff: "from-yellow-500 to-orange-500",
  durov: "from-blue-500 to-cyan-500",
  musk: "from-gray-600 to-gray-800",
  jobs: "from-gray-400 to-gray-600",
  bezos: "from-orange-400 to-amber-500",
  branson: "from-red-500 to-pink-500",
};

const confidenceIcons = {
  high: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  medium: <HelpCircle className="h-4 w-4 text-yellow-500" />,
  low: <AlertCircle className="h-4 w-4 text-red-500" />,
};

export function AdvisorCard({
  personaId,
  personaName,
  advice,
  keyPoints,
  riskAssessment,
  confidence,
  isLoading,
}: AdvisorCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br",
                personaColors[personaId] || "from-gray-500 to-gray-700"
              )}
            >
              {personaName[0]}
            </div>
            <CardTitle className="text-lg">{personaName}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {confidenceIcons[confidence as keyof typeof confidenceIcons]}
            <span className="text-xs text-gray-500 capitalize">{confidence}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main advice */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {advice}
          </p>
        </div>

        {/* Key points */}
        {keyPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Ключевые моменты:</h4>
            <ul className="space-y-1">
              {keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                >
                  <span className="mr-2 text-blue-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk assessment */}
        {riskAssessment && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              <strong>Риски:</strong> {riskAssessment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
