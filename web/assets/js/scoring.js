/* ============================================================
   OpenSpotAuto — scoring & palmarès
   Points = tier de rareté du modèle (catalogue) + bonus :
   • première capture du modèle : +50 %
   • premier spot de la marque : +25 pts
   Répétition d'un même modèle : points de base uniquement.
   ============================================================ */

const Scoring = (() => {
  const FIRST_MODEL_BONUS = 0.5;
  const FIRST_BRAND_BONUS = 25;

  function computePoints(brand, model, tierId, existingSpots) {
    const tier = Catalog.tierById[tierId] || Catalog.tierById.commun;
    let pts = tier.points;
    const bonuses = [];
    const seenModel = existingSpots.some(
      (s) => s.brand === brand && s.model === model
    );
    const seenBrand = existingSpots.some((s) => s.brand === brand);
    if (!seenModel) {
      const b = Math.round(tier.points * FIRST_MODEL_BONUS);
      pts += b;
      bonuses.push({ label: "Première capture du modèle", pts: b });
    }
    if (!seenBrand) {
      pts += FIRST_BRAND_BONUS;
      bonuses.push({ label: "Première marque", pts: FIRST_BRAND_BONUS });
    }
    return { total: pts, base: tier.points, bonuses };
  }

  /* ---------- Palmarès ---------- */

  const ACHIEVEMENTS = [
    { id: "spot-1",        icon: "📸", name: "Premier spot",        desc: "Capturer ta première voiture", check: (s) => s.count >= 1 },
    { id: "spot-10",       icon: "🔟", name: "10 spots",            desc: "Capturer 10 voitures", check: (s) => s.count >= 10 },
    { id: "spot-50",       icon: "🏆", name: "50 spots",            desc: "Capturer 50 voitures", check: (s) => s.count >= 50 },
    { id: "spot-100",      icon: "💯", name: "Centurion",           desc: "Capturer 100 voitures", check: (s) => s.count >= 100 },
    { id: "tier-rare",     icon: "🔷", name: "Chasseur de rares",   desc: "Spoter une voiture Rare", check: (s, spots) => spots.some((x) => x.tierRank >= 2) },
    { id: "tier-epique",   icon: "🟣", name: "Œil de lynx",         desc: "Spoter une voiture Épique", check: (s, spots) => spots.some((x) => x.tierRank >= 3) },
    { id: "tier-leg",      icon: "🥇", name: "Légende urbaine",     desc: "Spoter une voiture Légendaire", check: (s, spots) => spots.some((x) => x.tierRank >= 4) },
    { id: "tier-mythique", icon: "🌈", name: "Une dans un million", desc: "Spoter une voiture Mythique", check: (s, spots) => spots.some((x) => x.tierRank >= 5) },
    { id: "models-10",     icon: "🗂️", name: "Collectionneur",      desc: "10 modèles différents", check: (s) => s.models >= 10 },
    { id: "models-25",     icon: "🗃️", name: "Grand collectionneur",desc: "25 modèles différents", check: (s) => s.models >= 25 },
    { id: "models-50",     icon: "🏛️", name: "Musée roulant",       desc: "50 modèles différents", check: (s) => s.models >= 50 },
    { id: "brands-5",      icon: "🌐", name: "Éclectique",          desc: "5 marques différentes", check: (s) => s.brands >= 5 },
    { id: "brands-15",     icon: "🌍", name: "Globe-trotter",       desc: "15 marques différentes", check: (s) => s.brands >= 15 },
    { id: "night",         icon: "🌙", name: "Spotter nocturne",    desc: "Capturer entre 22 h et 6 h", check: (s, spots) => spots.some((x) => { const h = new Date(x.ts).getHours(); return h >= 22 || h < 6; }) },
    { id: "gps-3",         icon: "🧭", name: "Voyageur",            desc: "Spots dans 3 zones GPS différentes", check: (s, spots) => gpsZones(spots) >= 3 },
    { id: "marathon",      icon: "⚡", name: "Journée chargée",     desc: "5 spots en 24 h", check: (s, spots) => bestDay(spots) >= 5 },
    { id: "italia",        icon: "🇮🇹", name: "Transalpin",         desc: "5 voitures italiennes", check: (s, spots) => byCountry(spots, "Italie") >= 5 },
    { id: "allemagne",     icon: "🇩🇪", name: "Deutsch Qualität",   desc: "5 voitures allemandes", check: (s, spots) => byCountry(spots, "Allemagne") >= 5 },
    { id: "france",        icon: "🇫🇷", name: "Bleu Blanc Vroum",   desc: "5 voitures françaises", check: (s, spots) => byCountry(spots, "France") >= 5 },
    { id: "japon",         icon: "🇯🇵", name: "JDM",                desc: "5 voitures japonaises", check: (s, spots) => byCountry(spots, "Japon") >= 5 },
  ];

  function gpsZones(spots) {
    const z = new Set();
    for (const s of spots)
      if (s.gps) z.add(`${Math.round(s.gps.lat * 2) / 2},${Math.round(s.gps.lng * 2) / 2}`);
    return z.size;
  }

  function bestDay(spots) {
    const days = {};
    for (const s of spots) {
      const k = new Date(s.ts).toDateString();
      days[k] = (days[k] || 0) + 1;
    }
    return Math.max(0, ...Object.values(days));
  }

  function byCountry(spots, country) {
    return spots.filter(
      (s) => (CATALOG.find((b) => b.brand === s.brand) || {}).country === country
    ).length;
  }

  /* Recalcule tout le palmarès ; retourne les nouveaux débloqués. */
  function checkAchievements() {
    const p = Store.getActiveProfile();
    if (!p) return [];
    const spots = Store.getSpots();
    const stats = Store.profileStats(p.id);
    const fresh = [];
    for (const a of ACHIEVEMENTS) {
      if (a.check(stats, spots) && Store.unlockAchievement(a.id))
        fresh.push(a);
    }
    return fresh;
  }

  return { computePoints, checkAchievements, ACHIEVEMENTS };
})();
