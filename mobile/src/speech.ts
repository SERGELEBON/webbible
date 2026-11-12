// Android TextToSpeech limits a single utterance to 4,000 characters.
export function speechChunks(text: string, limit = 3000): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let chunk = "";
  for (const word of words) {
    if (chunk.length + word.length + 1 > limit) {
      if (chunk) chunks.push(chunk);
      chunk = "";
    }
    if (word.length > limit) {
      for (let i = 0; i < word.length; i += limit)
        chunks.push(word.slice(i, i + limit));
    } else chunk += (chunk ? " " : "") + word;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}
