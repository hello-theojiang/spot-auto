/* ============================================================
   OpenSpotAuto — store
   Persistance locale (localStorage) : profils, métadonnées des
   spots, palmarès, réglages. Les blobs photo eux-mêmes vivent
   dans IndexedDB (voir photos.js). Rien ne quitte l'appareil.
   ============================================================ */

const Store = (() => {
  const NS = "openspotauto.v1";

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(NS)) || {};
    } catch {
      return {};
    }
  };

  let state = load();
  const persist = () => localStorage.setItem(NS, JSON.stringify(state));

  /* ---------- Profils ---------- */

  const AVATARS = ["🚗", "🏎️", "🚙", "🕶️", "📸", "🏁", "⚡", "🛞", "🎯", "🌃"];

  const getProfiles = () => state.profiles || [];

  function getActiveProfile() {
    const id = state.activeProfileId;
    return getProfiles().find((p) => p.id === id) || null;
  }

  function createProfile(name, avatar) {
    const p = {
      id: `p${Date.now()}${Math.floor(Math.random() * 999)}`,
      name: (name || "Spotter").slice(0, 24),
      avatar: avatar || AVATARS[getProfiles().length % AVATARS.length],
      createdAt: Date.now(),
    };
    state.profiles = (state.profiles || []).concat(p);
    state.activeProfileId = p.id;
    dataOf(p.id); // init
    persist();
    return p;
  }

  function setActiveProfile(id) {
    if (getProfiles().some((p) => p.id === id)) {
      state.activeProfileId = id;
      persist();
    }
  }

  function renameProfile(id, name, avatar) {
    const p = getProfiles().find((x) => x.id === id);
    if (!p) return;
    if (name) p.name = name.slice(0, 24);
    if (avatar) p.avatar = avatar;
    persist();
  }

  function deleteProfile(id) {
    state.profiles = getProfiles().filter((p) => p.id !== id);
    if (state.activeProfileId === id)
      state.activeProfileId = state.profiles[0] ? state.profiles[0].id : null;
    if (state.data) delete state.data[id];
    persist();
  }

  /* ---------- Données par profil ---------- */

  function dataOf(pid) {
    state.data = state.data || {};
    state.data[pid] = state.data[pid] || {
      spots: [],
      achievements: [],
      ledgerTip: null,
      lastCaptureTs: 0,
    };
    return state.data[pid];
  }

  const activeData = () => {
    const p = getActiveProfile();
    return p ? dataOf(p.id) : null;
  };

  const getSpots = () => (activeData() || { spots: [] }).spots;

  function addSpot(spot) {
    const d = activeData();
    if (!d) return null;
    d.spots.push(spot);
    d.ledgerTip = spot.digest;
    d.lastCaptureTs = spot.ts;
    persist();
    return spot;
  }

  function removeSpot(id) {
    const d = activeData();
    if (!d) return;
    d.spots = d.spots.filter((s) => s.id !== id);
    persist();
  }

  const getSpot = (id) => getSpots().find((s) => s.id === id) || null;

  const getSpotsOf = (pid) => (dataOf(pid).spots || []);

  function unlockAchievement(id) {
    const d = activeData();
    if (!d || d.achievements.includes(id)) return false;
    d.achievements.push(id);
    persist();
    return true;
  }

  const getAchievements = () => (activeData() || { achievements: [] }).achievements;

  /* ---------- Réglages ---------- */

  const DEFAULT_SETTINGS = {
    cooldownSec: 30,        // délai min entre deux captures
    geminiKey: "",          // clé optionnelle — identification IA
    reduceMotion: false,
  };

  const getSettings = () => ({ ...DEFAULT_SETTINGS, ...(state.settings || {}) });
  const setSettings = (s) => {
    state.settings = { ...getSettings(), ...s };
    persist();
  };

  /* ---------- Stats dérivées ---------- */

  function profileStats(pid) {
    const d = dataOf(pid);
    const spots = d.spots || [];
    const score = spots.reduce((a, s) => a + (s.points || 0), 0);
    const models = new Set(spots.map((s) => `${s.brand}|${s.model}`));
    const brands = new Set(spots.map((s) => s.brand));
    const best = spots.reduce((a, s) => Math.max(a, s.tierRank || 0), -1);
    return {
      score,
      count: spots.length,
      models: models.size,
      brands: brands.size,
      bestTier: best,
    };
  }

  function leaderboard() {
    return getProfiles()
      .map((p) => ({ profile: p, ...profileStats(p.id) }))
      .sort((a, b) => b.score - a.score);
  }

  return {
    AVATARS,
    getProfiles, getActiveProfile, createProfile, setActiveProfile,
    renameProfile, deleteProfile,
    getSpots, getSpotsOf, addSpot, removeSpot, getSpot,
    unlockAchievement, getAchievements,
    getSettings, setSettings,
    profileStats, leaderboard,
    get lastCaptureTs() { return (activeData() || {}).lastCaptureTs || 0; },
    get ledgerTip() { return (activeData() || {}).ledgerTip || null; },
  };
})();
