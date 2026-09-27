# Architecture OpenSpotAuto

## Stack

- **Web SPA vanilla** (aucun build) : `web/index.html` + modules JS globaux chargés par `<script>` classiques, routage par hash (`app.js`).
- **Android** : shell `WebView` Gradle (`android/`) qui embarque `web/` dans `assets.srcDirs` et le sert via `WebViewAssetLoader` sur `https://appassets.androidplatform.net` (contexte sécurisé → `getUserMedia`, `crypto.subtle`, SW).
- **PWA** : `manifest.webmanifest` + `sw.js` (cache-first du shell applicatif).

## Persistance

| Donnée | Support |
|---|---|
| Profils, métadonnées des spots, palmarès, réglages | `localStorage` clé `openspotauto.v1` |
| Blobs photos | IndexedDB `openspotauto-photos` (`photos.js`) |

## Anti-triche (`anticheat.js` + `camera.js`)

Best-effort sans serveur — cumul de barrières :

1. **Capture live** : seul chemin d'entrée d'une photo est `getUserMedia` + `drawImage` au moment du déclenchement. Aucun `<input type=file>` n'existe.
2. **Vivacité** : fenêtre de ~2 s d'échantillonnage, diffs inter-frames + contraste. Une photo fixe (écran, affiche) produit des diffs ≈ 0 → déclencheur verrouillé.
3. **dHash 64 bits** : rejet des photos quasi identiques (distance de Hamming ≤ 6) déjà capturées par le profil.
4. **Registre chaîné** : `digest = sha256(prevTip | phash | ts | brand | model)` — supprimer ou modifier un spot casse la chaîne, vérifiable dans Réglages.
5. **Cohérence** : saut GPS > 800 km en < 1 h ou horodatage non monotone → flag sur le spot (visible, score conservé mais marqué).
6. **Cooldown** configurable entre captures.

Limites assumées : une vidéo de voiture filmée sur un autre écran peut passer la vivacité ; le GPS peut être simulé au niveau OS. Sans backend, l'intégrité absolue n'est pas garantissable.

## Score (`scoring.js`)

`points = tier.points` (10 → 1800) + `+50 %` première capture du modèle + `+25` première marque. Répétition d'un modèle = points de base.

## Identification IA (`ai.js`)

Optionnelle : clé Gemini en Réglages → `gemini-2.0-flash` reçoit la photo → `{brand, model, confidence}` → rapprochement souple au catalogue (`norm` lowercase + sans accents + overlap de tokens). Hors catalogue → tier Commun. Sans clé/hors-ligne → sélection manuelle.

## Tests

Mode `?mockcam` dans l'URL → flux caméra synthétique animé (vivacité satisfaite), pour tester les flows sans caméra.
