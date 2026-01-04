"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";

interface Persona {
  id: string;
  name: string;
  title: string;
  style: string;
  key_principles: string[];
}

interface PersonaSelectorProps {
  personas: Persona[];
  selected: string[];
  maxSelection?: number;
  onChange: (selected: string[]) => void;
}

const personaColors: Record<string, string> = {
  tinkoff: "from-yellow-500 to-orange-500",
  durov: "from-blue-500 to-cyan-500",
  musk: "from-gray-600 to-gray-800",
  jobs: "from-gray-400 to-gray-600",
  bezos: "from-orange-400 to-amber-500",
  branson: "from-red-500 to-pink-500",
};

export function PersonaSelector({
  personas,
  selected,
  maxSelection = 5,
  onChange,
}: PersonaSelectorProps) {
  const togglePersona = (personaId: string) => {
    if (selected.includes(personaId)) {
      onChange(selected.filter((id) => id !== personaId));
    } else if (selected.length < maxSelection) {
      onChange([...selected, personaId]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, personaId: string, isDisabled: boolean) => {
    if (isDisabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePersona(personaId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Выберите советников</Label>
        <span className="text-sm text-gray-500">
          {selected.length}/{maxSelection} выбрано
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => {
          const isSelected = selected.includes(persona.id);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <div
              key={persona.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => handleKeyDown(e, persona.id, isDisabled)}
              className={cn(
                "relative p-4 rounded-xl border-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && togglePersona(persona.id)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br",
                    personaColors[persona.id] || "from-gray-500 to-gray-700"
                  )}
                >
                  {persona.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{persona.name}</h3>
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="ml-2 pointer-events-none"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{persona.title}</p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {persona.style}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
