"use client";

import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenList, TokenDisplay } from "@/components/settings/token-list";
import { TokenForm } from "@/components/settings/token-form";
import { useTokens } from "@/hooks/use-tokens";

export default function TokensPage() {
  const [showForm, setShowForm] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const { tokens, isLoading, createToken, revokeToken } = useTokens();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">API Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Tokens for Quick Capture API and browser extension
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Token
        </Button>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="py-3 px-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            API tokens allow external apps to capture ideas to IdeaForge. Use them
            with the{" "}
            <a
              href="#usage"
              className="font-medium underline underline-offset-4 text-foreground"
            >
              Quick Capture API
            </a>{" "}
            or browser extension.
          </p>
        </CardContent>
      </Card>

      {newToken && (
        <TokenDisplay token={newToken} onDone={() => setNewToken(null)} />
      )}

      <TokenList
        tokens={tokens}
        isLoading={isLoading}
        onRevoke={revokeToken}
      />

      <div id="usage" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold">API Usage</h3>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Send a POST request to capture ideas:
          </p>
          <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
{`POST /api/capture
Authorization: Bearer idfc_your_token_here
Content-Type: application/json

{
  "title": "My brilliant idea",
  "idea": "Details about the idea...",
  "source_url": "https://example.com/inspiration",
  "create_project": true
}`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Set <code className="bg-muted px-1 rounded">create_project: true</code> to
            create a project immediately, or <code className="bg-muted px-1 rounded">false</code> to
            add to your inbox.
          </p>
        </div>
      </div>

      <TokenForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={createToken}
        onTokenCreated={setNewToken}
      />
    </div>
  );
}
