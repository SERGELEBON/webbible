import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  books,
  initialPassage,
  validPassage,
  verseKey,
  type Passage,
  type SavedVerse,
} from "./library";
export function useLibrary() {
  const [passage, setPassage] = useState<Passage>(initialPassage);
  const [saved, setSaved] = useState<SavedVerse[]>([]);
  const [fontSize, setFontSize] = useState(21);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem("litabible:v1")
      .then((raw) => {
        if (raw) {
          const value = JSON.parse(raw);
          if (validPassage(value.passage)) setPassage(value.passage);
          if (Array.isArray(value.saved))
            setSaved(
              value.saved.filter(
                (v: SavedVerse) =>
                  validPassage(v) &&
                  Number.isInteger(v.verse) &&
                  v.verse > 0 &&
                  v.verse <= books[v.book].chapters[v.chapter - 1].length,
              ),
            );
          if ([18, 21, 24, 27].includes(value.fontSize))
            setFontSize(value.fontSize);
          setDark(value.dark === true);
        }
      })
      .catch(() =>
        setStorageError("Impossible de charger les préférences enregistrées."),
      )
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      writes.current = writes.current
        .then(() =>
          AsyncStorage.setItem(
            "litabible:v1",
            JSON.stringify({ passage, saved, fontSize, dark }),
          ),
        )
        .catch(() => {
          setStorageError("Sauvegarde indisponible sur cet appareil.");
        });
  }, [ready, passage, saved, fontSize, dark]);
  function toggleSaved(v: SavedVerse) {
    setSaved((old) =>
      old.some((x) => verseKey(x) === verseKey(v))
        ? old.filter((x) => verseKey(x) !== verseKey(v))
        : [...old, v],
    );
  }
  return {
    passage,
    setPassage,
    saved,
    toggleSaved,
    fontSize,
    setFontSize,
    dark,
    setDark,
    ready,
    storageError,
  };
}
