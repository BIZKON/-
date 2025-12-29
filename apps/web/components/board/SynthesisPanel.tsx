"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, ListChecks } from "lucide-react";

interface SynthesisPanelProps {
  synthesis: string;
  actionItems: string[];
  consensusPoints: string[];
  conflictPoints: string[];
  isLoading?: boolean;
}

export function SynthesisPanel({
  synthesis,
  actionItems,
  consensusPoints,
  conflictPoints,
  isLoading,
}: SynthesisPanelProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
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
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ListChecks className="h-5 w-5 text-blue-600" />
          <span>Итоговый синтез</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main synthesis */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {synthesis}
          </p>
        </div>

        {/* Consensus points */}
        {consensusPoints.length > 0 && (
          <div>
            <h4 className="flex items-center text-sm font-semibold mb-3">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Точки согласия
            </h4>
            <ul className="space-y-2">
              {consensusPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-950 p-2 rounded-lg"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conflict points */}
        {conflictPoints.length > 0 && (
          <div>
            <h4 className="flex items-center text-sm font-semibold mb-3">
              <XCircle className="h-4 w-4 mr-2 text-orange-500" />
              Точки расхождения
            </h4>
            <ul className="space-y-2">
              {conflictPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-950 p-2 rounded-lg"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action items */}
        {actionItems.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">План действий</h4>
            <ol className="space-y-2">
              {actionItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
