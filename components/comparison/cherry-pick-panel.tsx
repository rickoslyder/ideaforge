"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectableSection } from "./selectable-section";
import { SectionMarker } from "./section-marker";
import { MergePreview } from "./merge-preview";
import { parseSpecIntoSections, type ParsedSection } from "@/lib/parsers/spec-sections";
import { useComparison } from "@/hooks/use-comparison";
import type { CherryPickedSection, SelectedModel, ComparisonColumn } from "@/types/comparison";

interface CherryPickPanelProps {
  models: SelectedModel[];
  columns: Record<string, ComparisonColumn>;
  onApplyMerge?: (content: string) => void;
  className?: string;
}

export function CherryPickPanel({
  models,
  columns,
  onApplyMerge,
  className,
}: CherryPickPanelProps) {
  const {
    cherryPickedSections,
    addCherryPick,
    removeCherryPick,
    clearCherryPicks,
    reorderCherryPicks,
  } = useComparison();

  // Parse all columns into sections
  const parsedByModel = useMemo(() => {
    const result: Record<string, ParsedSection[]> = {};
    models.forEach((model) => {
      const column = columns[model.id];
      if (column?.content) {
        result[model.id] = parseSpecIntoSections(column.content);
      }
    });
    return result;
  }, [models, columns]);

  const isSectionSelected = (modelId: string, sectionId: string) => {
    return cherryPickedSections.some(
      (s) => s.modelId === modelId && s.sectionId === sectionId
    );
  };

  const handleToggleSection = (modelId: string, section: ParsedSection) => {
    const key = `${modelId}-${section.id}`;
    if (isSectionSelected(modelId, section.id)) {
      removeCherryPick(key);
    } else {
      const cherryPick: CherryPickedSection = {
        sectionId: key,
        modelId,
        content: `## ${section.title}\n\n${section.content}`,
        startIndex: section.startIndex,
        endIndex: section.endIndex,
      };
      addCherryPick(cherryPick);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Cherry Pick Sections</CardTitle>
            {cherryPickedSections.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCherryPicks}
                className="h-8"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No models selected for comparison
            </p>
          ) : (
            <Tabs defaultValue={models[0]?.id} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                {models.map((model) => (
                  <TabsTrigger key={model.id} value={model.id}>
                    {model.displayName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {models.map((model) => {
                const sections = parsedByModel[model.id] || [];

                return (
                  <TabsContent
                    key={model.id}
                    value={model.id}
                    className="mt-3"
                  >
                    {sections.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No sections found. Generate content first.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {sections.map((section) => (
                          <SelectableSection
                            key={section.id}
                            id={section.id}
                            title={section.title}
                            content={section.content}
                            level={section.level}
                            isSelected={isSectionSelected(model.id, section.id)}
                            modelId={model.id}
                            onSelect={() => handleToggleSection(model.id, section)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Selected sections order */}
      {cherryPickedSections.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Selected Sections ({cherryPickedSections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cherryPickedSections.map((section, index) => (
                <SectionMarker
                  key={section.sectionId}
                  section={section}
                  index={index}
                  onRemove={() => removeCherryPick(section.sectionId)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge preview */}
      <MergePreview
        sections={cherryPickedSections}
        onApply={onApplyMerge}
      />
    </div>
  );
}
