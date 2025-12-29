"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Key, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-gray-500 mt-1">
          Управляйте настройками вашего аккаунта и предпочтениями
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Профиль
          </CardTitle>
          <CardDescription>
            Основная информация о вашем аккаунте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input id="fullName" placeholder="Иван Петров" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Организация</Label>
            <Input id="organization" placeholder="ООО Компания" disabled />
          </div>
          <Button disabled>Сохранить изменения</Button>
        </CardContent>
      </Card>

      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Стиль рекомендаций
          </CardTitle>
          <CardDescription>
            Настройте стиль и тон советов от экспертов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Тон общения</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              defaultValue="balanced"
              disabled
            >
              <option value="formal">Формальный</option>
              <option value="balanced">Сбалансированный</option>
              <option value="casual">Неформальный</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Уровень риска</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              defaultValue="moderate"
              disabled
            >
              <option value="conservative">Консервативный</option>
              <option value="moderate">Умеренный</option>
              <option value="aggressive">Агрессивный</option>
            </select>
          </div>
          <Button disabled>Сохранить настройки</Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            API Ключи
          </CardTitle>
          <CardDescription>
            Управление API ключами для self-hosted версии
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anthropicKey">Anthropic API Key</Label>
            <Input
              id="anthropicKey"
              type="password"
              placeholder="sk-ant-..."
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openaiKey">OpenAI API Key</Label>
            <Input
              id="openaiKey"
              type="password"
              placeholder="sk-..."
              disabled
            />
          </div>
          <p className="text-sm text-gray-500">
            Функция доступна в Enterprise версии
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
