/* ============================================================
   OpenSpotAuto — composants UI partagés
   Icônes SVG inline, toasts, modale, helpers de rendu tiers.
   ============================================================ */

const UI = (() => {
  /* ---------- Icônes ---------- */

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
    capture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="4"/></svg>',
    garage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H4a3 3 0 0 0 4 5M16 5h4a3 3 0 0 1-4 5"/><path d="M12 12v4m-4 4h8l-1-4h-6z"/></svg>',
    medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="5"/><path d="m8.5 10-3-6h5l1.5 3 1.5-3h5l-3 6"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.5c2.5.5 4.5 2.6 4.5 5.5"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 20h20z"/><path d="M12 10v5m0 3v.5"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M18 6l-2.5 2.5m-7 7L6 18"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l1.5-5A2 2 0 0 1 8.4 6.5h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 13h16a1 1 0 0 1 1 1v4h-3.5M4 14v4h3.5"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 7V4m4 3V4m-4 16v-3m4 3v-3"/></svg>',
  };

  const icon = (name) => `<span class="ico">${ICONS[name] || ICONS.car}</span>`;

  /* ---------- Toasts ---------- */

  function toast(msg, kind = "") {
    const root = document.getElementById("toast-root");
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  /* ---------- Modale ---------- */

  function modal(html, onClose) {
    const root = document.getElementById("modal-root");
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal">${html}</div>`;
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
    });
    function close() {
      wrap.remove();
      onClose && onClose();
    }
    root.appendChild(wrap);
    return { el: wrap, close };
  }

  /* ---------- Helpers ---------- */

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const tier = (id) => Catalog.tierById[id] || Catalog.tierById.commun;

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString("fr-FR", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  /* Carte spot façon "carte holographique". */
  function spotCard(s, url) {
    const t = tier(s.tier);
    return `
      <a class="spot-card tier-${t.id}" href="#/spots/${s.id}">
        <div class="spot-card-img">${url ? `<img src="${url}" alt="${esc(s.brand)} ${esc(s.model)}" loading="lazy">` : `<div class="spot-noimg">${icon("car")}</div>`}<div class="holo-sheen"></div></div>
        <div class="spot-card-body">
          <div class="spot-card-title">${esc(s.brand)} <b>${esc(s.model)}</b></div>
          <div class="spot-card-meta">
            <span class="tier-chip tier-${t.id}">${t.label}</span>
            <span class="spot-pts">+${s.points}</span>
          </div>
          ${s.flags && s.flags.length ? `<div class="spot-flags">${icon("warn")} signalé</div>` : ""}
        </div>
      </a>`;
  }

  return { icon, icons: ICONS, toast, modal, esc, tier, fmtDate, spotCard };
})();
