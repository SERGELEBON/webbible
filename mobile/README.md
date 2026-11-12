# LitaBible mobile

Application **React Native + Expo + TypeScript** pour Android et iOS, ajoutée au dépôt `SERGELEBON/webbible`. Elle reprend le bleu, le jaune, le logo et les usages bibliques du site https://litabible.com.

## Fonctionnalités

- Accueil, verset du jour, reprise de lecture et accès aux 66 livres.
- Bible Louis Segond 1910 complète embarquée : lecture et recherche sans connexion.
- Navigation par livre et chapitre, favoris de versets et partage natif.
- Lecture par synthèse vocale française avec arrêt et gestion des chapitres longs.
- Réglage du texte et thème sombre. Préférences et favoris sauvegardés sur l’appareil.
- Composants React Native (`View`, `Text`, `FlatList`, `Pressable`, `Modal`), zones sûres et libellés d’accessibilité. L’aperçu web utilise les mêmes composants via React Native Web.

## Aperçus

Captures de l’application React Native Web en format mobile :

<img src="docs/home-mobile.png" width="290" alt="Accueil LitaBible" /> <img src="docs/reader-dark.png" width="290" alt="Lecture en thème sombre" />

[Voir la vidéo des tests de navigation](docs/mobile-demo.mp4) (Chromium, format mobile ; pas un émulateur Android).

## Sur téléphone avec Expo Go

Node.js 20.19+ et npm sont nécessaires.

```sh
cd mobile
npm ci
npm start
```

Installer une version d’Expo Go compatible avec **Expo SDK 54** depuis https://expo.dev/go, puis scanner le QR code du terminal. Le téléphone et l’ordinateur doivent être sur le même réseau. Sinon :

```sh
npx expo start --tunnel
```

Sur iOS, l’App Store ne distribue que la version courante d’Expo Go : si SDK 54 n’est plus pris en charge, utiliser un development build EAS ou un simulateur compatible.

## Émulateur Android / simulateur iOS

Installer Android Studio avec un appareil virtuel, ou Xcode sur macOS, puis :

```sh
npm run android
# Sur macOS avec Xcode :
npm run ios
```

## APK Android à installer

Avec un compte Expo et EAS CLI :

```sh
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

EAS demandera de lier l’application à votre compte et de configurer la signature. Le profil `preview` produit un APK ; aucun APK signé n’est inclus dans cette branche.

## Aperçu et vérification

```sh
npm run web
npm run typecheck
npm test
# Playwright démarre le serveur web automatiquement :
npx playwright install chromium ffmpeg
npm run test:e2e
npm run export
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Les tests Playwright utilisent Chromium installé par Playwright par défaut. Pour le Chromium du système : `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`.

Tests fonctionnels : lecture, sélection des livres et chapitres, recherche, favoris persistants après rechargement, thème et taille du texte, absence de débordement à 320 px et navigation après coupure réseau. Les tests unitaires vérifient les données, les limites de navigation, la recherche et les limites natives de synthèse vocale.

**Limites de validation :** les tests fonctionnels exécutent l’export React Native Web en émulation mobile, pas un émulateur Android/iOS. La création des bundles Android et iOS ne remplace pas un test sur appareil. Le son, le partage et les gestes natifs restent à vérifier sur téléphone.

Le frontend et le backend existants sont conservés. Cette version mobile fonctionne de façon autonome : elle ne synchronise pas les lectures du jour, comptes, langues ou enregistrements audio du site. Voir [DATA-SOURCES.md](DATA-SOURCES.md).
