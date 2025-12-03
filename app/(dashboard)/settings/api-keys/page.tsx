"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { ApiKeyList } from "@/components/settings/api-key-list";
import { ProviderConfig } from "@/components/settings/provider-config";
import { useApiKeys } from "@/hooks/use-api-keys";
import { Separator } from "@/components/ui/separator";

export default function ApiKeysPage() {
  const [showForm, setShowForm] = useState(false);
  const { apiKeys, isLoading, addApiKey, removeApiKey, setDefaultApiKey } =
    useApiKeys();

  const configuredProviders = [...new Set(apiKeys.map((k) => k.provider))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage your LLM provider API keys
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add API Key
        </Button>
      </div>

      <ApiKeyList
        apiKeys={apiKeys}
        isLoading={isLoading}
        onDelete={removeApiKey}
        onSetDefault={setDefaultApiKey}
      />

      <Separator />

      <ProviderConfig configuredProviders={configuredProviders} />

      <ApiKeyForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={addApiKey}
      />
    </div>
  );
}
