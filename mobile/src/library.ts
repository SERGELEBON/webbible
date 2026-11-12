import data from "./bible.json";
export type Passage = { book: number; chapter: number };
export type SavedVerse = Passage & { verse: number };
export const books = data as {
  id: number;
  name: string;
  chapters: string[][];
}[];
export const initialPassage: Passage = { book: 42, chapter: 1 };
export function bookFor(p: Passage) {
  return books[p.book];
}
export function reference(p: Passage) {
  return `${bookFor(p).name} ${p.chapter}`;
}
export function verseKey(p: SavedVerse) {
  return `${p.book}:${p.chapter}:${p.verse}`;
}
export function validPassage(p: unknown): p is Passage {
  if (!p || typeof p !== "object") return false;
  const v = p as Passage;
  return (
    Number.isInteger(v.book) &&
    !!books[v.book] &&
    Number.isInteger(v.chapter) &&
    v.chapter > 0 &&
    v.chapter <= books[v.book].chapters.length
  );
}
export function move(p: Passage, direction: number): Passage {
  const chapter = p.chapter + direction;
  if (chapter > bookFor(p).chapters.length)
    return p.book < books.length - 1 ? { book: p.book + 1, chapter: 1 } : p;
  if (chapter < 1)
    return p.book > 0
      ? { book: p.book - 1, chapter: books[p.book - 1].chapters.length }
      : p;
  return { ...p, chapter };
}
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function search(query: string, limit = 60) {
  const q = normalize(query.trim());
  const results: (SavedVerse & { text: string })[] = [];
  if (q.length < 2) return results;
  for (let book = 0; book < books.length; book++)
    for (let c = 0; c < books[book].chapters.length; c++) {
      const verses = books[book].chapters[c];
      for (let v = 0; v < verses.length; v++)
        if (normalize(verses[v]).includes(q)) {
          results.push({ book, chapter: c + 1, verse: v + 1, text: verses[v] });
          if (results.length >= limit) return results;
        }
    }
  return results;
}
