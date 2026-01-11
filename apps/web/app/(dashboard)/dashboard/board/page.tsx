"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PersonaSelector } from "@/components/board/PersonaSelector";
import { AdvisorCard } from "@/components/board/AdvisorCard";
import { SynthesisPanel } from "@/components/board/SynthesisPanel";
import { agentsApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface AdvisorResponse {
  persona_id: string;
  persona_name: string;
  advice: string;
  key_points: string[];
  risk_assessment: string;
  confidence: string;
}

interface SynthesisData {
  synthesis: string;
  action_items: string[];
  consensus_points: string[];
  conflict_points: string[];
}

export default function BoardMeetingPage() {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState<Set<string>>(new Set());
  const [advisorResponses, setAdvisorResponses] = useState<AdvisorResponse[]>([]);
  const [synthesis, setSynthesis] = useState<SynthesisData | null>(null);
  const [status, setStatus] = useState("");

  const { data: personas = [] } = useQuery({
    queryKey: ["personas"],
    queryFn: async () => {
      const response = await agentsApi.personas();
      return response.data;
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!question.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите вопрос для обсуждения",
      });
      return;
    }

    if (selectedPersonas.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите хотя бы одного советника",
      });
      return;
    }

    setIsLoading(true);
    setAdvisorResponses([]);
    setSynthesis(null);
    setLoadingPersonas(new Set(selectedPersonas));

    try {
      const stream = agentsApi.boardMeetingStream({
        question,
        personas: selectedPersonas,
      });

      for await (const chunk of stream) {
        switch (chunk.type) {
          case "status":
            setStatus(chunk.message);
            break;

          case "advisor_start":
            setLoadingPersonas((prev) => {
              const next = new Set(prev);
              next.add(chunk.persona_id);
              return next;
            });
            break;

          case "advisor_response":
            setLoadingPersonas((prev) => {
              const next = new Set(prev);
              next.delete(chunk.data.persona_id);
              return next;
            });
            setAdvisorResponses((prev) => [...prev, chunk.data]);
            break;

          case "advisor_error":
            setLoadingPersonas((prev) => {
              const next = new Set(prev);
              next.delete(chunk.persona_id);
              return next;
            });
            toast({
              variant: "destructive",
              title: `Ошибка от ${chunk.persona_id}`,
              description: "Не удалось получить ответ от советника",
            });
            break;

          case "synthesis":
            setSynthesis(chunk.data);
            break;

          case "complete":
            setStatus("");
            break;
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось провести совещание. Попробуйте позже.",
      });
    } finally {
      setIsLoading(false);
      setLoadingPersonas(new Set());
    }
  }, [question, selectedPersonas, toast]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Совет Директоров</h1>
        <p className="text-gray-500 mt-1">
          Получите персонализированные советы от цифровых двойников успешных предпринимателей
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle id="question-title">Задайте вопрос</CardTitle>
          <CardDescription id="question-desc">
            Опишите вашу бизнес-проблему или вопрос для обсуждения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question input */}
          <div className="space-y-2">
            <Textarea
              aria-labelledby="question-title"
              aria-describedby="question-desc"
              placeholder="Например: Как увеличить продажи на 30% в следующем квартале при ограниченном бюджете на маркетинг?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>

          {/* Persona selector */}
          <PersonaSelector
            personas={personas}
            selected={selectedPersonas}
            maxSelection={5}
            onChange={setSelectedPersonas}
          />

          {/* Submit button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {status && (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status}
                </span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedPersonas.length === 0 || !question.trim()}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Получить советы
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(advisorResponses.length > 0 || loadingPersonas.size > 0) && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Советы экспертов</h2>

          {/* Advisor responses grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Loading cards for pending personas */}
            {Array.from(loadingPersonas).map((personaId) => {
              const persona = personas.find((p: any) => p.id === personaId);
              return (
                <AdvisorCard
                  key={personaId}
                  personaId={personaId}
                  personaName={persona?.name || personaId}
                  advice=""
                  keyPoints={[]}
                  riskAssessment=""
                  confidence="medium"
                  isLoading
                />
              );
            })}

            {/* Completed responses */}
            {advisorResponses.map((response) => (
              <AdvisorCard
                key={response.persona_id}
                personaId={response.persona_id}
                personaName={response.persona_name}
                advice={response.advice}
                keyPoints={response.key_points}
                riskAssessment={response.risk_assessment}
                confidence={response.confidence}
              />
            ))}
          </div>

          {/* Synthesis panel */}
          {synthesis ? (
            <SynthesisPanel
              synthesis={synthesis.synthesis}
              actionItems={synthesis.action_items}
              consensusPoints={synthesis.consensus_points}
              conflictPoints={synthesis.conflict_points}
            />
          ) : isLoading ? (
            <SynthesisPanel
              synthesis=""
              actionItems={[]}
              consensusPoints={[]}
              conflictPoints={[]}
              isLoading
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
