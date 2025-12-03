"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

interface TextContextInputProps {
  onTextSubmit: (name: string, content: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TextContextInput({
  onTextSubmit,
  disabled,
  className,
}: TextContextInputProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return;

    onTextSubmit(name.trim(), content.trim());
    setName("");
    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("gap-2", className)}
        >
          <FileText className="h-4 w-4" />
          Add Text Context
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Text Context</DialogTitle>
          <DialogDescription>
            Add plain text context that will be included when generating
            specifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context-name">Name</Label>
            <Input
              id="context-name"
              placeholder="e.g., Technical Requirements"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context-content">Content</Label>
            <Textarea
              id="context-content"
              placeholder="Paste or type your context here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !content.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Context
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
