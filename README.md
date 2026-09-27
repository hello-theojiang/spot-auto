# OpenSpotAuto

**Car spotting gamifié** : photographie des voitures dans la rue, chaque spot reçoit un **tier de rareté** (Commun → Mythique) qui rapporte des points, un **palmarès** de badges et un **classement** entre profils — le tout avec un design holographique, **100 % local et hors-ligne**.

## Fonctionnalités

- **Capture live uniquement** — aucun import de photo possible : on ne peut spotter qu'en visant une vraie voiture.
- **Catalogue intégré** : ~45 marques / ~500 modèles avec tiers de rareté prédéfinis — la source de vérité du score.
- **Anti-triche** (meilleur effort, tout local) : détection de vivacité de la scène (bloque la photo d'un écran/affiche), hash perceptuel anti-doublon, registre chaîné SHA-256 inviolable, cohérence GPS + horodatage, cooldown entre captures.
- **Métadonnées** : chaque spot enregistre position GPS, date/heure, infos caméra, hash photo et empreinte de registre.
- **Identification IA optionnelle** : une clé Gemini gratuite (Google AI Studio, saisie dans Réglages) propose automatiquement marque + modèle à partir de la photo ; le catalogue tranche toujours la rareté.
- **Photos stockées in-app** (IndexedDB) : affichables en permanence dans le Garage.
- **Palmarès** : 20 badges (première Mythique, JDM, collectionneur…).
- **Leaderboard local** multi-profils sur le même appareil.
- **CGU + Mentions légales** intégrées.
- **PWA** installable (service worker hors-ligne) + **APK Android** (shell WebView).

## Structure

```
web/       → l'app complète (SPA vanilla, hash routing) — source unique
android/   → shell WebView Gradle qui embarque web/ tel quel
docs/      → notes d'architecture
```

## Lancer la version web

```sh
cd web && python3 -m http.server 8080
# → http://localhost:8080
```

La caméra exige un contexte sécurisé : `localhost` ou HTTPS (pas `file://`, pas une IP locale). Pour tester sans caméra : `http://localhost:8080/?mockcam` (flux synthétique animé).

## Android (APK)

```sh
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

La CI (`.github/workflows/android.yml`) build l'APK à chaque push et le publie en release sur les tags `v*`. Le shell sert `web/` via `WebViewAssetLoader` en HTTPS locale → caméra, GPS et crypto disponibles. L'APK debug est signé avec la clé debug (installation directe OK).

## Confettis de configuration

- **Réglages → clé Gemini** : optionnelle, jamais commitée, stockée dans `localStorage` de l'appareil.
- **Réglages → cooldown** : délai minimal entre deux captures (10 s → 5 min).
- **Réglages → vérifier l'intégrité** : recalcule la chaîne du registre pour détecter toute falsification.

## Vie privée

Tout reste sur l'appareil — photos (IndexedDB), scores et profils (localStorage). Seule exception opt-in : « Identifier avec l'IA » envoie la photo à l'API Google configurée par votre clé.
