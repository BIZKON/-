"use client";

import Link from "next/link";
import { ArrowRight, Users, FileText, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">CEO-OS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Начать бесплатно</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ваш персональный Совет Директоров
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Получайте советы от цифровых двойников известных предпринимателей.
            Маск, Тиньков, Дуров и другие помогут принять правильные бизнес-решения.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/register">
              Попробовать бесплатно
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Совет Директоров</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Выберите до 5 советников и получите их уникальные взгляды на вашу бизнес-проблему.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-purple-100 dark:bg-purple-900 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Контекст бизнеса</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Загрузите документы компании — стратегию, OKR, финансы — и получите персонализированные советы.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-green-100 dark:bg-green-900 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Мгновенный синтез</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Система анализирует все советы и создает actionable план действий.
            </p>
          </div>
        </div>

        {/* Personas Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Ваши советники</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "Elon Musk", role: "First Principles" },
              { name: "Олег Тиньков", role: "Маркетинг" },
              { name: "Павел Дуров", role: "Продукт" },
              { name: "Steve Jobs", role: "Дизайн" },
              { name: "Jeff Bezos", role: "Клиенты" },
            ].map((persona) => (
              <div
                key={persona.name}
                className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-md flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {persona.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{persona.name}</p>
                  <p className="text-sm text-gray-500">{persona.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-500">
          <p>&copy; 2024 CEO-OS. Операционная система для бизнеса.</p>
        </div>
      </footer>
    </div>
  );
}
