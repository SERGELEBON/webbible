import { test } from "node:test";
import assert from "node:assert/strict";
import { books, move, search, validPassage, verseKey } from "../src/library";
test("la Bible complète contient 66 livres et des chapitres non vides", () => {
  assert.equal(books.length, 66);
  for (const book of books) {
    assert.ok(book.chapters.length > 0);
    for (const c of book.chapters)
      assert.ok(c.every((v) => typeof v === "string" && v.trim().length > 0));
  }
  assert.match(books[0].chapters[0][0], /Au commencement/);
  assert.match(books[42].chapters[2][15], /Dieu a tant aimé/);
});
test("navigation aux limites des livres et de la Bible", () => {
  assert.deepEqual(move({ book: 0, chapter: 50 }, 1), { book: 1, chapter: 1 });
  assert.deepEqual(move({ book: 1, chapter: 1 }, -1), { book: 0, chapter: 50 });
  assert.deepEqual(move({ book: 0, chapter: 1 }, -1), { book: 0, chapter: 1 });
  assert.deepEqual(move({ book: 65, chapter: 22 }, 1), {
    book: 65,
    chapter: 22,
  });
});
test("recherche sans distinction de casse ou accents et résultats plafonnés", () => {
  assert.deepEqual(search(""), []);
  assert.deepEqual(search("a"), []);
  assert.deepEqual(search("ÉTERNEL"), search("eternel"));
  assert.equal(search("Dieu").length, 60);
  assert.ok(
    search("Dieu a tant aimé").some(
      (v) => v.book === 42 && v.chapter === 3 && v.verse === 16,
    ),
  );
});
test("les préférences rejetent les références invalides", () => {
  assert.equal(validPassage({ book: 0, chapter: 1 }), true);
  for (const p of [
    null,
    {},
    { book: -1, chapter: 1 },
    { book: 66, chapter: 1 },
    { book: 0, chapter: 51 },
    { book: 0, chapter: 1.5 },
  ])
    assert.equal(validPassage(p), false);
  assert.notEqual(
    verseKey({ book: 0, chapter: 1, verse: 1 }),
    verseKey({ book: 0, chapter: 1, verse: 2 }),
  );
});
import { speechChunks } from "../src/speech";
test("les longs chapitres sont découpés sans dépasser les limites natives", () => {
  const text = books[18].chapters[118].join(" ");
  const chunks = speechChunks(text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.length <= 3000));
  assert.equal(chunks.join(" "), text.split(/\s+/).filter(Boolean).join(" "));
  assert.deepEqual(speechChunks(""), []);
});
