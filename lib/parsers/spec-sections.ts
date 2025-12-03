export interface ParsedSection {
  id: string;
  title: string;
  content: string;
  level: number;
  startIndex: number;
  endIndex: number;
}

// Parse markdown content into selectable sections based on headings
export function parseSpecIntoSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split("\n");

  let currentSection: Partial<ParsedSection> | null = null;
  let sectionStartLine = 0;
  let currentContent: string[] = [];
  let sectionIdCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection && currentSection.title) {
        const sectionContent = currentContent.join("\n").trim();
        sections.push({
          id: `section-${sectionIdCounter++}`,
          title: currentSection.title,
          content: sectionContent,
          level: currentSection.level || 1,
          startIndex: currentSection.startIndex || 0,
          endIndex: content.indexOf(sectionContent) + sectionContent.length,
        });
      }

      // Start new section
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentSection = {
        title,
        level,
        startIndex: content.indexOf(line, sectionStartLine),
      };
      currentContent = [];
      sectionStartLine = i;
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection && currentSection.title) {
    const sectionContent = currentContent.join("\n").trim();
    sections.push({
      id: `section-${sectionIdCounter}`,
      title: currentSection.title,
      content: sectionContent,
      level: currentSection.level || 1,
      startIndex: currentSection.startIndex || 0,
      endIndex: content.length,
    });
  }

  return sections;
}

// Alternative: parse into paragraphs for more granular selection
export function parseIntoParagraphs(content: string): ParsedSection[] {
  const paragraphs: ParsedSection[] = [];
  const parts = content.split(/\n\n+/);

  let currentIndex = 0;
  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (trimmed) {
      const startIndex = content.indexOf(trimmed, currentIndex);
      paragraphs.push({
        id: `para-${index}`,
        title: `Paragraph ${index + 1}`,
        content: trimmed,
        level: 0,
        startIndex,
        endIndex: startIndex + trimmed.length,
      });
      currentIndex = startIndex + trimmed.length;
    }
  });

  return paragraphs;
}

// Get section at a specific position
export function getSectionAtPosition(
  sections: ParsedSection[],
  position: number
): ParsedSection | undefined {
  return sections.find(
    (s) => position >= s.startIndex && position <= s.endIndex
  );
}
