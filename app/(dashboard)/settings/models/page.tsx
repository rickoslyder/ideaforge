"use client";

import { Sparkles } from "lucide-react";
import { ModelDefaults } from "@/components/settings/model-defaults";
import { PhaseModelConfig } from "@/components/settings/phase-model-config";

export default function ModelsSettingsPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Model Configuration</h1>
        </div>
        <p className="text-muted-foreground">
          Configure which AI models to use for generating specifications and plans
        </p>
      </div>

      <div className="space-y-6">
        <ModelDefaults />
        <PhaseModelConfig />
      </div>
    </div>
  );
}
