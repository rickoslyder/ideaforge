"use client";

import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionList } from "./section-list";
import { createDefaultSpecConfig } from "@/lib/constants/default-sections";
import type { SpecSection, SpecConfig } from "@/types/spec";

interface SpecConfiguratorProps {
  config: SpecConfig;
  onChange: (config: SpecConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function SpecConfigurator({
  config,
  onChange,
  onGenerate,
  isGenerating,
}: SpecConfiguratorProps) {
  const [editingSection, setEditingSection] = useState<SpecSection | null>(
    null
  );
  const [showAddDialog, setShowAddDialog] = useState(false);

  const enabledCount = config.sections.filter((s) => s.enabled).length;

  function handleReorder(sections: SpecSection[]) {
    onChange({ ...config, sections });
  }

  function handleToggle(id: string, enabled: boolean) {
    const sections = config.sections.map((s) =>
      s.id === id ? { ...s, enabled } : s
    );
    onChange({ ...config, sections });
  }

  function handleDelete(id: string) {
    const sections = config.sections.filter((s) => s.id !== id);
    onChange({ ...config, sections });
  }

  function handleEdit(section: SpecSection) {
    setEditingSection(section);
  }

  function handleSaveSection(section: SpecSection) {
    const sections = config.sections.map((s) =>
      s.id === section.id ? section : s
    );
    onChange({ ...config, sections });
    setEditingSection(null);
  }

  function handleAddSection(section: Omit<SpecSection, "id" | "order">) {
    const newSection: SpecSection = {
      ...section,
      id: nanoid(),
      order: config.sections.length,
    };
    onChange({ ...config, sections: [...config.sections, newSection] });
    setShowAddDialog(false);
  }

  function handleReset() {
    onChange(createDefaultSpecConfig());
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Specification Sections</CardTitle>
              <CardDescription>
                Configure which sections to include in your specification.
                Drag to reorder.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SectionList
            sections={config.sections.sort((a, b) => a.order - b.order)}
            onReorder={handleReorder}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Instructions</CardTitle>
          <CardDescription>
            Add any additional instructions for the AI when generating your
            specification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Focus on scalability, use React and Node.js, include detailed API documentation..."
            value={config.customInstructions || ""}
            onChange={(e) =>
              onChange({ ...config, customInstructions: e.target.value })
            }
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {enabledCount} of {config.sections.length} sections enabled
        </p>
        <Button onClick={onGenerate} disabled={isGenerating || enabledCount === 0}>
          {isGenerating ? "Generating..." : "Generate Specification"}
        </Button>
      </div>

      {/* Edit Section Dialog */}
      <SectionDialog
        open={!!editingSection}
        onOpenChange={() => setEditingSection(null)}
        section={editingSection}
        onSave={(section) => {
          if ("id" in section && "order" in section) {
            handleSaveSection(section as SpecSection);
          }
        }}
        title="Edit Section"
      />

      {/* Add Section Dialog */}
      <SectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={(section) => {
          if (!("id" in section)) {
            handleAddSection(section);
          }
        }}
        title="Add Section"
      />
    </div>
  );
}

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: SpecSection | null;
  onSave: (section: SpecSection | Omit<SpecSection, "id" | "order">) => void;
  title: string;
}

function SectionDialog({
  open,
  onOpenChange,
  section,
  onSave,
  title,
}: SectionDialogProps) {
  const [name, setName] = useState(section?.name || "");
  const [description, setDescription] = useState(section?.description || "");
  const [prompt, setPrompt] = useState(section?.prompt || "");

  // Reset form when dialog opens with a section
  useState(() => {
    if (section) {
      setName(section.name);
      setDescription(section.description);
      setPrompt(section.prompt);
    } else {
      setName("");
      setDescription("");
      setPrompt("");
    }
  });

  function handleSave() {
    if (!name.trim() || !prompt.trim()) return;

    if (section) {
      onSave({
        ...section,
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
      });
    } else {
      onSave({
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
        required: false,
        enabled: true,
      });
    }

    setName("");
    setDescription("");
    setPrompt("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure the section name, description, and AI prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-name">Name</Label>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Security Requirements"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Description</Label>
            <Input
              id="section-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this section"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-prompt">AI Prompt</Label>
            <Textarea
              id="section-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Instructions for the AI when generating this section..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !prompt.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
