/* ============================================================
   OpenSpotAuto — identification IA (optionnelle)
   Envoi de la photo à Gemini (clé gratuite Google AI Studio,
   saisie dans Réglages, stockée localement) pour proposer
   automatiquement marque + modèle. Le résultat est matché au
   catalogue intégré qui reste la source de vérité du score.
   Hors-ligne ou sans clé : sélection manuelle au catalogue.
   ============================================================ */

const AI = (() => {
  const MODEL = "gemini-2.0-flash";

  const hasKey = () => !!Store.getSettings().geminiKey;

  function blobToB64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  /* Réponse attendue : {"brand":"…","model":"…"} JSON strict. */
  async function identify(blob) {
    const key = Store.getSettings().geminiKey;
    if (!key) throw new Error("no-key");

    const b64 = await blobToB64(blob);
    const prompt =
      "Tu es un expert en identification de voitures. Identifie la voiture " +
      "principale sur cette photo. Réponds UNIQUEMENT avec un objet JSON " +
      'valide : {"brand":"Marque","model":"Modèle","confidence":0-1}. ' +
      "Si tu n'es pas sûr du modèle exact, donne la gamme (ex: \"911\"). " +
      "Si aucune voiture n'est identifiable : {\"brand\":null,\"model\":null}.";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: b64 } },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 128 },
        }),
      }
    );

    if (!res.ok) throw new Error("api-" + res.status);
    const json = await res.json();
    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const m = text.match(/\{[^}]+\}/s);
    if (!m) throw new Error("bad-response");
    const parsed = JSON.parse(m[0]);
    if (!parsed.brand) return null;
    return match(parsed.brand, parsed.model || "", parsed.confidence);
  }

  /* Rapprochement IA → catalogue (matching souple). */
  function match(brand, model, confidence) {
    const norm = (s) =>
      s.toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const nb = norm(brand), nm = norm(model);

    let b = CATALOG.find((x) => norm(x.brand) === nb)
      || CATALOG.find((x) => norm(x.brand).includes(nb) || nb.includes(norm(x.brand)));
    if (!b) return { brand, model, confidence, matched: null };

    let best = null;
    for (const name of Object.keys(b.models)) {
      const nn = norm(name);
      if (nn === nm || nn.includes(nm) || nm.includes(nn)) {
        best = name;
        break;
      }
      // token overlap
      const a = new Set(nn.split(" ")), c = nm.split(" ");
      const overlap = c.filter((t) => a.has(t)).length;
      if (overlap >= 1 && (!best || nm.length > norm(best).length)) best = best || name;
    }
    return { brand: b.brand, model: best || model, confidence, matched: best };
  }

  return { identify, hasKey };
})();
