export interface ChunkOptions {
  maxChunkSize: number;
  overlap: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxChunkSize: 4000, // ~1000 tokens
  overlap: 200,
};

export interface ContentChunk {
  content: string;
  index: number;
  start: number;
  end: number;
}

export function chunkContent(
  content: string,
  options: Partial<ChunkOptions> = {}
): ContentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: ContentChunk[] = [];

  if (content.length <= opts.maxChunkSize) {
    return [
      {
        content,
        index: 0,
        start: 0,
        end: content.length,
      },
    ];
  }

  let start = 0;
  let index = 0;

  while (start < content.length) {
    let end = Math.min(start + opts.maxChunkSize, content.length);

    // Try to break at a sentence or paragraph boundary
    if (end < content.length) {
      const breakPoints = ["\n\n", ".\n", ". ", "\n"];
      for (const bp of breakPoints) {
        const lastBreak = content.lastIndexOf(bp, end);
        if (lastBreak > start + opts.maxChunkSize / 2) {
          end = lastBreak + bp.length;
          break;
        }
      }
    }

    chunks.push({
      content: content.slice(start, end).trim(),
      index,
      start,
      end,
    });

    start = end - opts.overlap;
    if (start >= content.length) break;
    index++;
  }

  return chunks;
}

export function summarizeChunks(chunks: ContentChunk[]): string {
  if (chunks.length === 1) {
    return chunks[0].content;
  }

  // For multiple chunks, include chunk markers
  return chunks
    .map((chunk, i) => `[Part ${i + 1}/${chunks.length}]\n${chunk.content}`)
    .join("\n\n---\n\n");
}
