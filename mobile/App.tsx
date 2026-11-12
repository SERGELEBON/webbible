import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Icon, type IconName } from "./src/components/Icon";
import { Button } from "./src/components/Button";
import * as Speech from "expo-speech";
import {
  books,
  bookFor,
  move,
  reference,
  search,
  verseKey,
  type Passage,
  type SavedVerse,
} from "./src/library";
import { useLibrary } from "./src/useLibrary";
import { speechChunks } from "./src/speech";
import { s } from "./src/styles";

type Tab = "home" | "reader" | "search" | "saved";
const blue = "#1a4fa0",
  gold = "#f5c400";
const daily: SavedVerse[] = [
  { book: 18, chapter: 23, verse: 1 },
  { book: 42, chapter: 3, verse: 16 },
  { book: 18, chapter: 119, verse: 105 },
  { book: 49, chapter: 4, verse: 13 },
  { book: 22, chapter: 40, verse: 31 },
  { book: 19, chapter: 3, verse: 5 },
  { book: 42, chapter: 14, verse: 27 },
];
function AppContent() {
  const lib = useLibrary();
  const {
    passage,
    setPassage,
    saved,
    toggleSaved,
    fontSize,
    setFontSize,
    dark,
    setDark,
  } = lib;
  const [tab, setTab] = useState<Tab>("home");
  const [picker, setPicker] = useState(false);
  const [pickedBook, setPickedBook] = useState<number | null>(null);
  const [settings, setSettings] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [selected, setSelected] = useState<SavedVerse | null>(null);
  const [toast, setToast] = useState("");
  const speechSession = useRef(0);
  const reader = useRef<FlatList<string>>(null);
  const paper = dark ? "#131c2c" : "#f8f7f3",
    card = dark ? "#1d2a40" : "#ffffff",
    ink = dark ? "#f1f3f8" : "#182940",
    muted = dark ? "#b6c2d3" : "#748092";
  const today = new Date();
  const verseOfDay =
    daily[
      Math.floor(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) /
          86400000,
      ) % daily.length
    ];
  const verseText = (v: SavedVerse) =>
    books[v.book].chapters[v.chapter - 1][v.verse - 1];
  const results = useMemo(() => search(searchQuery), [searchQuery]);
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    speechSession.current++;
    void Speech.stop();
    setSpeaking(false);
    reader.current?.scrollToOffset({ offset: 0, animated: false });
  }, [passage.book, passage.chapter]);
  useEffect(
    () => () => {
      speechSession.current++;
      void Speech.stop();
    },
    [],
  );
  function open(p: Passage) {
    setSelected(null);
    setPassage({ book: p.book, chapter: p.chapter });
    setTab("reader");
    setPicker(false);
    setPickedBook(null);
  }
  async function play() {
    setAudioError("");
    if (speaking) {
      speechSession.current++;
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      !("speechSynthesis" in window)
    ) {
      setAudioError(
        "La synthèse vocale n’est pas disponible dans ce navigateur.",
      );
      return;
    }
    setSpeaking(true);
    const session = ++speechSession.current;
    const chunks = speechChunks(
      bookFor(passage).chapters[passage.chapter - 1].join(" "),
    );
    const fail = () => {
      if (session !== speechSession.current) return;
      setSpeaking(false);
      setAudioError(
        "Lecture vocale indisponible. Vérifiez les voix françaises de votre appareil.",
      );
    };
    function next(index: number) {
      if (session !== speechSession.current) return;
      if (index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      try {
        Speech.speak(chunks[index], {
          language: "fr-FR",
          rate: 0.88,
          onDone: () => next(index + 1),
          onError: fail,
        });
      } catch {
        fail();
      }
    }
    next(0);
  }
  async function share(v: SavedVerse) {
    try {
      await Share.share({
        message: `« ${verseText(v)} »\n${reference(v)}, ${v.verse} — Louis Segond 1910\nhttps://litabible.com`,
      });
    } catch {
      setToast("Le partage n’est pas disponible.");
    }
  }
  const txt = (extra?: object) => [{ color: ink }, extra];
  const section = (title: string, right?: string, action?: () => void) => (
    <View style={s.sectionHead}>
      <Text style={txt(s.sectionTitle)}>{title}</Text>
      {right && (
        <Pressable accessibilityRole="button" onPress={action} hitSlop={10}>
          <Text
            style={{
              color: dark ? "#b4d0ff" : blue,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {right} →
          </Text>
        </Pressable>
      )}
    </View>
  );
  if (!lib.ready)
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: paper }]}>
        <ActivityIndicator accessibilityLabel="Chargement" color={blue} />
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: paper }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={[s.shell, { backgroundColor: paper }]}>
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Image
                source={require("./assets/logo-white.png")}
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={txt(s.brandTitle)}>
                Lita<Text style={{ color: dark ? gold : blue }}>Bible</Text>
                <Text style={{ color: gold }}>.</Text>
              </Text>
              <Text style={{ color: muted, fontSize: 10, letterSpacing: 1.3 }}>
                JE LIS LA PAROLE DE DIEU
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            onPress={() => setSettings(true)}
            style={[s.iconButton, { backgroundColor: card }]}
          >
            <Icon name="options-outline" color={ink} />
          </Pressable>
        </View>
        {lib.storageError ? (
          <Text accessibilityRole="alert" style={s.error}>
            {lib.storageError}
          </Text>
        ) : null}
        {tab === "home" && (
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.greetingRow}>
              <View>
                <Text style={[s.eyebrow, { color: muted }]}>
                  {today
                    .toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                    .toUpperCase()}
                </Text>
                <Text style={txt(s.greeting)}>Un moment avec Dieu.</Text>
              </View>
              <View style={s.sun}>
                <Icon name="sunny-outline" color="#b78a1c" size={26} />
              </View>
            </View>
            <View style={s.hero}>
              <View style={s.heroCircle} />
              <View style={s.heroTop}>
                <View style={s.heroLabel}>
                  <Icon name="sparkles-outline" color={gold} size={15} />
                  <Text style={s.heroEyebrow}>LA PAROLE DU JOUR</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Partager le verset du jour"
                  onPress={() => void share(verseOfDay)}
                  hitSlop={12}
                >
                  <Icon name="share-outline" color="#d5e3fb" size={21} />
                </Pressable>
              </View>
              <Text style={s.quoteMark}>“</Text>
              <Text style={s.heroVerse}>{verseText(verseOfDay).trim()}</Text>
              <Text style={s.heroReference}>
                {reference(verseOfDay)}, {verseOfDay.verse}
              </Text>
              <View style={s.heroBottom}>
                <Text style={s.heroEdition}>LOUIS SEGOND 1910</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Lire le chapitre du verset du jour"
                  onPress={() => open(verseOfDay)}
                  style={s.heroLink}
                >
                  <Text style={s.heroLinkText}>Lire le chapitre</Text>
                  <Icon name="arrow-forward" color={blue} size={17} />
                </Pressable>
              </View>
            </View>
            {section("Reprendre ma lecture")}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reprendre ${reference(passage)}`}
              onPress={() => open(passage)}
              style={[s.resume, { backgroundColor: card }]}
            >
              <View style={s.bookTile}>
                <Icon name="book-outline" size={26} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={txt({ fontSize: 18, fontWeight: "700" })}>
                  {reference(passage)}
                </Text>
                <Text style={{ color: muted, fontSize: 13, marginTop: 5 }}>
                  Louis Segond · Français
                </Text>
              </View>
              <View style={s.roundArrow}>
                <Icon name="arrow-forward" size={19} />
              </View>
            </Pressable>
            {section("Nourrir sa foi")}
            <View style={s.tiles}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ouvrir la Bible"
                onPress={() => {
                  setPicker(true);
                  setPickedBook(null);
                }}
                style={[s.tile, { backgroundColor: card }]}
              >
                <View style={[s.smallTileIcon, { backgroundColor: "#edf2fa" }]}>
                  <Icon name="library-outline" />
                </View>
                <Text style={txt(s.tileTitle)}>La Bible</Text>
                <Text style={{ color: muted, fontSize: 13, lineHeight: 20 }}>
                  66 livres à découvrir,{`\n`}à votre rythme.
                </Text>
                <Text style={s.tileLink}>Explorer →</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ouvrir la lecture audio"
                onPress={() => {
                  setTab("reader");
                  void play();
                }}
                style={[s.tile, { backgroundColor: card }]}
              >
                <View style={[s.smallTileIcon, { backgroundColor: "#fcf5df" }]}>
                  <Icon name="headset-outline" color="#9a7720" />
                </View>
                <Text style={txt(s.tileTitle)}>Bible audio</Text>
                <Text style={{ color: muted, fontSize: 13, lineHeight: 20 }}>
                  La Parole vous{`\n`}accompagne.
                </Text>
                <Text style={s.tileLink}>Écouter →</Text>
              </Pressable>
            </View>
            {section("Votre rendez-vous quotidien", "Lire", () =>
              open({ book: 18, chapter: 23 }),
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lire le Psaume 23"
              onPress={() => open({ book: 18, chapter: 23 })}
              style={[s.dailyCard, { backgroundColor: card }]}
            >
              <View style={s.dailyDate}>
                <Text style={{ color: blue, fontSize: 11, fontWeight: "700" }}>
                  PSAUME
                </Text>
                <Text style={{ color: blue, fontSize: 30, fontWeight: "600" }}>
                  23
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={txt({ fontSize: 16, fontWeight: "700" })}>
                  Le Seigneur est mon berger
                </Text>
                <Text style={{ color: muted, fontSize: 13, marginTop: 5 }}>
                  Une lecture pour trouver la paix
                </Text>
                <Text style={{ color: "#a38842", fontSize: 11, marginTop: 8 }}>
                  6 VERSETS · 2 MIN DE LECTURE
                </Text>
              </View>
            </Pressable>
            <View style={s.offline}>
              <Icon name="cloud-done-outline" color={muted} size={16} />
              <Text style={{ color: muted, fontSize: 12 }}>
                Toute la Bible, disponible hors ligne.
              </Text>
            </View>
          </ScrollView>
        )}
        {tab === "reader" && (
          <View style={{ flex: 1 }}>
            <View
              style={[
                s.readerToolbar,
                { borderColor: dark ? "#344158" : "#e9e8e3" },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choisir un livre et un chapitre"
                onPress={() => {
                  setPickedBook(null);
                  setPicker(true);
                }}
                style={s.passagePicker}
              >
                <Text
                  style={txt({
                    fontSize: 22,
                    fontWeight: "700",
                    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                  })}
                >
                  {reference(passage)}
                </Text>
                <Icon name="chevron-down" color={ink} size={18} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Taille du texte"
                onPress={() => setSettings(true)}
                style={s.iconButton}
              >
                <Text style={txt({ fontSize: 20 })}>Aa</Text>
              </Pressable>
            </View>
            <Text
              style={{
                color: muted,
                textAlign: "center",
                fontSize: 11,
                letterSpacing: 1.8,
                paddingVertical: 12,
              }}
            >
              LOUIS SEGOND 1910 · FRANÇAIS
            </Text>
            <FlatList
              ref={reader}
              data={bookFor(passage).chapters[passage.chapter - 1]}
              keyExtractor={(_, i) => `${passage.book}:${passage.chapter}:${i}`}
              contentContainerStyle={{
                paddingHorizontal: 25,
                paddingBottom: 25,
              }}
              renderItem={({ item, index }) => {
                const v = { ...passage, verse: index + 1 };
                const active = saved.some((x) => verseKey(x) === verseKey(v));
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Verset ${index + 1}${active ? ", enregistré" : ""}. ${item}`}
                    onPress={() => setSelected(v)}
                    style={[
                      s.verse,
                      {
                        backgroundColor: active
                          ? dark
                            ? "#3f3922"
                            : "#fff4cc"
                          : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? "#9b7d24" : muted,
                        fontSize: 11,
                        paddingTop: 6,
                        width: 25,
                      }}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        txt({
                          fontSize,
                          lineHeight: fontSize * 1.65,
                          fontFamily:
                            Platform.OS === "ios" ? "Georgia" : "serif",
                        }),
                        { flex: 1 },
                      ]}
                    >
                      {item.trim()}
                    </Text>
                    {active && (
                      <Icon name="bookmark" color="#ae8a1b" size={13} />
                    )}
                  </Pressable>
                );
              }}
              ListHeaderComponent={
                <Text
                  style={txt({
                    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                    fontSize: 30,
                    textAlign: "center",
                    marginVertical: 20,
                  })}
                >
                  {bookFor(passage).name}
                  <Text style={{ color: blue }}> {passage.chapter}</Text>
                </Text>
              }
            />
            {audioError ? (
              <Text accessibilityRole="alert" style={s.error}>
                {audioError}
              </Text>
            ) : null}
            <View style={[s.audioBar, { backgroundColor: card }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chapitre précédent"
                disabled={passage.book === 0 && passage.chapter === 1}
                onPress={() => setPassage(move(passage, -1))}
                style={s.iconButton}
              >
                <Icon name="chevron-back" color={ink} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  speaking ? "Arrêter la lecture" : "Écouter le chapitre"
                }
                onPress={() => void play()}
                style={s.play}
              >
                <Icon
                  name={speaking ? "stop" : "play"}
                  color="white"
                  size={19}
                />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={txt({ fontWeight: "600", fontSize: 13 })}>
                  {speaking ? "Lecture en cours…" : "Écouter le chapitre"}
                </Text>
                <Text style={{ color: muted, fontSize: 11, marginTop: 3 }}>
                  Synthèse vocale · Français
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chapitre suivant"
                disabled={passage.book === 65 && passage.chapter === 22}
                onPress={() => setPassage(move(passage, 1))}
                style={s.iconButton}
              >
                <Icon name="chevron-forward" color={ink} />
              </Pressable>
            </View>
          </View>
        )}
        {tab === "search" && (
          <View style={[s.content, { flex: 1 }]}>
            <Text style={txt(s.pageTitle)}>Chercher dans la Parole</Text>
            <Text
              style={{
                color: muted,
                fontSize: 14,
                marginTop: 7,
                marginBottom: 22,
              }}
            >
              Un mot peut éclairer votre journée.
            </Text>
            <View style={[s.searchBox, { backgroundColor: card }]}>
              <Icon name="search-outline" color={muted} />
              <TextInput
                accessibilityLabel="Rechercher dans la Bible"
                placeholder="Paix, amour, espérance…"
                placeholderTextColor={muted}
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: ink,
                  paddingVertical: 13,
                }}
              />
              {query && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Effacer la recherche"
                  onPress={() => setQuery("")}
                >
                  <Icon name="close-circle" color={muted} size={20} />
                </Pressable>
              )}
            </View>
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: muted, fontSize: 12, marginVertical: 15 }}
            >
              {searchQuery.trim().length < 2
                ? "Saisissez au moins 2 caractères."
                : `${results.length}${results.length === 60 ? " premiers" : ""} résultats`}
            </Text>
            <FlatList
              data={results}
              keyExtractor={verseKey}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Lire ${reference(item)}, ${item.verse}`}
                  onPress={() => {
                    open(item);
                    setSelected(item);
                  }}
                  style={[s.result, { backgroundColor: card }]}
                >
                  <Text
                    style={{
                      color: dark ? "#b4d0ff" : blue,
                      fontWeight: "700",
                      marginBottom: 8,
                    }}
                  >
                    {reference(item)}, {item.verse}
                  </Text>
                  <Text style={txt({ fontSize: 16, lineHeight: 25 })}>
                    {item.text.trim()}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                searchQuery.trim().length >= 2 ? (
                  <Text
                    style={{ color: muted, textAlign: "center", marginTop: 40 }}
                  >
                    Aucun verset trouvé. Essayez un autre mot.
                  </Text>
                ) : (
                  <View style={s.empty}>
                    <Icon name="search-outline" size={40} color="#a7b9d1" />
                    <Text style={{ color: muted, marginTop: 16 }}>
                      Explorez les 66 livres de la Bible.
                    </Text>
                  </View>
                )
              }
            />
          </View>
        )}
        {tab === "saved" && (
          <View style={[s.content, { flex: 1 }]}>
            <Text style={txt(s.pageTitle)}>Mes favoris</Text>
            <Text
              style={{
                color: muted,
                fontSize: 14,
                marginTop: 7,
                marginBottom: 22,
              }}
            >
              Les paroles que vous gardez près du cœur.
            </Text>
            <FlatList
              data={saved}
              keyExtractor={verseKey}
              renderItem={({ item }) => (
                <View style={[s.result, { backgroundColor: card }]}>
                  <View style={s.sectionHead}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => open(item)}
                    >
                      <Text
                        style={{
                          color: dark ? "#b4d0ff" : blue,
                          fontWeight: "700",
                        }}
                      >
                        {reference(item)}, {item.verse}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Retirer ${reference(item)}, ${item.verse} des favoris`}
                      onPress={() => toggleSaved(item)}
                      hitSlop={10}
                    >
                      <Icon name="bookmark" size={20} />
                    </Pressable>
                  </View>
                  <Text
                    style={txt({
                      fontSize: 18,
                      lineHeight: 28,
                      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                    })}
                  >
                    {verseText(item)}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={s.empty}>
                  <Icon name="bookmark-outline" size={44} color="#a7b9d1" />
                  <Text
                    style={txt({
                      fontSize: 20,
                      fontWeight: "600",
                      marginTop: 20,
                    })}
                  >
                    Un trésor à construire
                  </Text>
                  <Text
                    style={{
                      color: muted,
                      textAlign: "center",
                      lineHeight: 23,
                      marginVertical: 15,
                    }}
                  >
                    Touchez un verset pendant votre lecture{`\n`}pour l’ajouter
                    à vos favoris.
                  </Text>
                  <Button
                    dark={dark}
                    label="Commencer à lire"
                    onPress={() => open(passage)}
                    icon="book-outline"
                  />
                </View>
              }
            />
          </View>
        )}
        {toast ? (
          <Text accessibilityLiveRegion="polite" style={s.toast}>
            {toast}
          </Text>
        ) : null}
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: card }}>
          <View
            style={[
              s.tabBar,
              {
                backgroundColor: card,
                borderColor: dark ? "#344158" : "#e9e8e3",
              },
            ]}
          >
            {(
              [
                {
                  key: "home",
                  icon: "home-outline",
                  active: "home",
                  label: "Accueil",
                },
                {
                  key: "reader",
                  icon: "book-outline",
                  active: "book",
                  label: "La Bible",
                },
                {
                  key: "search",
                  icon: "search-outline",
                  active: "search",
                  label: "Recherche",
                },
                {
                  key: "saved",
                  icon: "bookmark-outline",
                  active: "bookmark",
                  label: "Favoris",
                },
              ] as {
                key: Tab;
                icon: IconName;
                active: IconName;
                label: string;
              }[]
            ).map((t) => (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                aria-selected={tab === t.key}
                onPress={() => setTab(t.key)}
                style={s.tab}
              >
                <View
                  style={[
                    s.tabIcon,
                    tab === t.key && {
                      backgroundColor: dark ? "#344b70" : "#edf2fa",
                    },
                  ]}
                >
                  <Icon
                    name={tab === t.key ? t.active : t.icon}
                    color={tab === t.key ? (dark ? "#b4d0ff" : blue) : muted}
                    size={22}
                  />
                </View>
                <Text
                  style={{
                    color: tab === t.key ? (dark ? "#b4d0ff" : blue) : muted,
                    fontWeight: tab === t.key ? "700" : "400",
                    fontSize: 10,
                    marginTop: 3,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </View>
      <Modal
        visible={picker}
        animationType={Platform.OS === "web" ? "none" : "slide"}
        onRequestClose={() => setPicker(false)}
      >
        <SafeAreaView style={[s.safe, { backgroundColor: paper }]}>
          <View style={s.modalHead}>
            <Text style={txt(s.pageTitle)}>
              {pickedBook === null
                ? "Choisir un livre"
                : books[pickedBook].name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer le choix du livre"
              onPress={() => setPicker(false)}
              style={s.iconButton}
            >
              <Icon name="close" color={ink} />
            </Pressable>
          </View>
          {pickedBook === null ? (
            <FlatList
              data={books}
              keyExtractor={(b) => String(b.id)}
              renderItem={({ item, index }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => setPickedBook(index)}
                  style={[
                    s.bookRow,
                    { borderColor: dark ? "#344158" : "#e9e8e3" },
                  ]}
                >
                  <Text style={{ color: muted, fontSize: 12, width: 32 }}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text style={txt({ flex: 1, fontSize: 17 })}>
                    {item.name}
                  </Text>
                  <Text style={{ color: muted, fontSize: 12, marginRight: 10 }}>
                    {item.chapters.length} chap.
                  </Text>
                  <Icon name="chevron-forward" size={16} color={muted} />
                </Pressable>
              )}
            />
          ) : (
            <View style={{ flex: 1, padding: 20 }}>
              <Button
                dark={dark}
                label="Tous les livres"
                secondary
                onPress={() => setPickedBook(null)}
                icon="arrow-back"
              />
              <Text style={{ color: muted, marginVertical: 20 }}>
                CHOISIR UN CHAPITRE
              </Text>
              <FlatList
                data={books[pickedBook].chapters}
                numColumns={5}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ index }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Chapitre ${index + 1}`}
                    onPress={() =>
                      open({ book: pickedBook, chapter: index + 1 })
                    }
                    style={[s.chapter, { backgroundColor: card }]}
                  >
                    <Text style={txt({ fontSize: 18 })}>{index + 1}</Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
      <Modal
        visible={settings}
        transparent
        animationType={Platform.OS === "web" ? "none" : "fade"}
        onRequestClose={() => setSettings(false)}
      >
        <View style={s.overlay}>
          <View style={[s.sheet, { backgroundColor: card }]}>
            <View style={s.sectionHead}>
              <Text style={txt(s.pageTitle)}>Votre confort de lecture</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer les réglages"
                onPress={() => setSettings(false)}
                style={s.iconButton}
              >
                <Icon name="close" color={ink} />
              </Pressable>
            </View>
            <Text style={{ color: muted, marginBottom: 14 }}>
              Taille du texte
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[18, 21, 24, 27].map((n) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={`Texte ${n}`}
                  aria-checked={fontSize === n}
                  key={n}
                  onPress={() => setFontSize(n)}
                  style={[
                    s.fontOption,
                    { backgroundColor: fontSize === n ? blue : paper },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: n,
                      color: fontSize === n ? "#fff" : ink,
                    }}
                  >
                    Aa
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text
              style={txt({
                fontSize,
                lineHeight: fontSize * 1.6,
                fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                marginVertical: 20,
              })}
            >
              Ta parole est une lampe à mes pieds.
            </Text>
            <Button
              dark={dark}
              label={
                dark ? "Activer le thème clair" : "Activer le thème sombre"
              }
              secondary
              onPress={() => setDark(!dark)}
              icon={dark ? "sunny-outline" : "moon-outline"}
            />
            <Text
              style={{
                color: muted,
                fontSize: 12,
                lineHeight: 19,
                marginTop: 22,
              }}
            >
              LitaBible · Louis Segond 1910, domaine public.{`\n`}66 livres
              accessibles hors ligne. Lecture audio par synthèse vocale de
              l’appareil.
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!selected}
        transparent
        animationType={Platform.OS === "web" ? "none" : "fade"}
        onRequestClose={() => setSelected(null)}
      >
        <View style={s.overlay}>
          <View style={[s.sheet, { backgroundColor: card }]}>
            {selected && (
              <>
                <View style={s.sectionHead}>
                  <Text style={txt({ fontSize: 21, fontWeight: "700" })}>
                    {reference(selected)}, {selected.verse}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fermer le verset"
                    onPress={() => setSelected(null)}
                    style={s.iconButton}
                  >
                    <Icon name="close" color={ink} />
                  </Pressable>
                </View>
                <Text
                  style={txt({
                    fontSize: 20,
                    lineHeight: 32,
                    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                    marginBottom: 22,
                  })}
                >
                  {verseText(selected)}
                </Text>
                <Button
                  dark={dark}
                  label={
                    saved.some((v) => verseKey(v) === verseKey(selected))
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                  onPress={() => {
                    toggleSaved(selected);
                    setToast("Favoris mis à jour");
                    setSelected(null);
                  }}
                  icon="bookmark-outline"
                />
                <View style={{ height: 10 }} />
                <Button
                  dark={dark}
                  label="Partager ce verset"
                  secondary
                  onPress={() => void share(selected)}
                  icon="share-outline"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
