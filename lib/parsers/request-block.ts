// Parse request blocks from AI responses
// Format: <request>content</request>

export interface RequestBlock {
  type: "request";
  content: string;
  raw: string;
}

export interface TextBlock {
  type: "text";
  content: string;
}

export type ParsedBlock = RequestBlock | TextBlock;

const REQUEST_PATTERN = /<request>([\s\S]*?)<\/request>/g;

export function parseRequestBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let lastIndex = 0;
  let match;

  REQUEST_PATTERN.lastIndex = 0;

  while ((match = REQUEST_PATTERN.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index).trim();
      if (textContent) {
        blocks.push({ type: "text", content: textContent });
      }
    }

    // Add the request block
    blocks.push({
      type: "request",
      content: match[1].trim(),
      raw: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex).trim();
    if (textContent) {
      blocks.push({ type: "text", content: textContent });
    }
  }

  // If no blocks found, return the entire text as a text block
  if (blocks.length === 0 && text.trim()) {
    blocks.push({ type: "text", content: text.trim() });
  }

  return blocks;
}

export function extractRequest(text: string): string | null {
  REQUEST_PATTERN.lastIndex = 0;
  const match = REQUEST_PATTERN.exec(text);
  return match ? match[1].trim() : null;
}

export function hasRequestBlock(text: string): boolean {
  REQUEST_PATTERN.lastIndex = 0;
  return REQUEST_PATTERN.test(text);
}
