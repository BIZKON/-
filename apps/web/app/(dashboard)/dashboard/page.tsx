"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, FileText, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { documentsApi } from "@/lib/api";

export default function DashboardPage() {
  const { data: documents } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await documentsApi.list();
      return response.data;
    },
  });

  const stats = [
    {
      title: "Документы",
      value: documents?.total || 0,
      description: "Загруженных документов",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Советники",
      value: 6,
      description: "Доступных персон",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Консультации",
      value: 0,
      description: "Проведённых сессий",
      icon: MessageSquare,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Добро пожаловать в CEO-OS — вашу операционную систему для бизнеса
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Совет Директоров</CardTitle>
            <CardDescription>
              Получите персонализированные советы от цифровых двойников известных предпринимателей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/dashboard/board">
                Начать консультацию
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Документы</CardTitle>
            <CardDescription>
              Загрузите документы компании для более точных рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/documents">
                Управление документами
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      {documents?.documents && documents.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Последние документы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.documents.slice(0, 5).map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.doc_type}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === "ready"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {doc.status === "ready" ? "Готов" : doc.status === "processing" ? "Обработка" : "Ошибка"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
