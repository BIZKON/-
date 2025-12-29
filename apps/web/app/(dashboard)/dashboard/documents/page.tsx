"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { documentsApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const docTypes = [
  { value: "strategy", label: "Стратегия" },
  { value: "okr", label: "OKR / Цели" },
  { value: "finance", label: "Финансы" },
  { value: "process", label: "Процессы" },
  { value: "other", label: "Другое" },
];

export default function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState("strategy");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await documentsApi.list();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Документ удалён" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить документ",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [".pdf", ".docx", ".txt"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      toast({
        variant: "destructive",
        title: "Неподдерживаемый формат",
        description: "Поддерживаются файлы: PDF, DOCX, TXT",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", selectedDocType);
    formData.append("title", file.name);

    try {
      await documentsApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Документ загружен",
        description: "Обработка может занять некоторое время",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: error.response?.data?.detail || "Попробуйте ещё раз",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Готов";
      case "processing":
        return "Обработка...";
      case "error":
        return "Ошибка";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Документы</h1>
        <p className="text-gray-500 mt-1">
          Загрузите документы компании для более точных рекомендаций
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузить документ</CardTitle>
          <CardDescription>
            Поддерживаются форматы: PDF, DOCX, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Doc type selector */}
            <div className="space-y-2">
              <Label>Тип документа</Label>
              <select
                className="w-full sm:w-48 h-10 px-3 rounded-md border border-input bg-background"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                disabled={uploading}
              >
                {docTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload button */}
            <div className="flex-1 flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Выбрать файл
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Загруженные документы</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : data?.documents?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Нет документов
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Загрузите документы, чтобы получить более точные рекомендации
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="capitalize">
                          {docTypes.find((t) => t.value === doc.doc_type)?.label ||
                            doc.doc_type}
                        </span>
                        {doc.chunk_count > 0 && (
                          <span>• {doc.chunk_count} фрагментов</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm text-gray-500">
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
