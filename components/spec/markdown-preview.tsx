"use client";

import { useState } from "react";
import { Copy, Check, Download, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface MarkdownPreviewProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
}

export function MarkdownPreview({
  content,
  onChange,
  editable = false,
  className,
}: MarkdownPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "specification.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
        {editable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg overflow-auto max-h-[600px]">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  );
}

// Simple markdown renderer - in production, use react-markdown or similar
function MarkdownRenderer({ content }: { content: string }) {
  // Very basic markdown to HTML conversion for preview
  // In a real app, use a proper markdown library
  const html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-3"><code>$2</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Unordered lists
    .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, "</p><p class='my-2'>")
    .replace(/\n/g, "<br />");

  return (
    <div
      dangerouslySetInnerHTML={{ __html: `<p class="my-2">${html}</p>` }}
    />
  );
}
