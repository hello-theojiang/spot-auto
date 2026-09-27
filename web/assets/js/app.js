/* ============================================================
   OpenSpotAuto — routeur par hash + navigation.
   Routes : #/accueil #/capture #/spots[/id] #/classement
            #/palmares #/profils #/reglages #/legal/<page>
   ============================================================ */

const App = (() => {
  const TABS = [
    { route: "#/accueil",    label: "Accueil",    icon: "home" },
    { route: "#/capture",    label: "Capturer",   icon: "capture" },
    { route: "#/spots",      label: "Garage",     icon: "garage" },
    { route: "#/classement", label: "Classement", icon: "trophy" },
    { route: "#/palmares",   label: "Palmarès",   icon: "medal" },
  ];

  const ROUTES = [
    { re: /^#\/accueil$/,                view: HomeView },
    { re: /^#\/capture$/,                view: CaptureView },
    { re: /^#\/spots(?:\/([\w-]+))?$/,   view: null }, // résolu ci-dessous
    { re: /^#\/classement$/,             view: ClassementView },
    { re: /^#\/palmares$/,               view: PalmaresView },
    { re: /^#\/profils$/,                view: ProfilsView },
    { re: /^#\/reglages$/,               view: ReglagesView },
    { re: /^#\/legal\/([\w-]+)$/,        view: LegalView },
  ];

  let activeView = null;

  function currentRoute() {
    const h = location.hash || "#/accueil";
    for (const r of ROUTES) {
      const m = h.match(r.re);
      if (!m) continue;
      const params = m.slice(1).filter(Boolean);
      if (r.re.source.includes("spots")) {
        return { view: params.length ? SpotView : SpotsView, params, hash: h };
      }
      return { view: r.view, params, hash: h };
    }
    return { view: HomeView, params: [], hash: "#/accueil" };
  }

  function renderNav() {
    const html = TABS.map(
      (t) => `<a href="${t.route}" data-route="${t.route}">${UI.icon(t.icon)}<span>${t.label}</span></a>`
    ).join("");
    document.getElementById("tabbar").innerHTML = html;
    document.getElementById("nav").innerHTML = html +
      `<a href="#/profils" data-route="#/profils">${UI.icon("users")}<span>Profils</span></a>
       <a href="#/reglages" data-route="#/reglages">${UI.icon("gear")}<span>Réglages</span></a>`;
  }

  function highlightNav(hash) {
    const top = TABS.find((t) => hash.startsWith(t.route));
    document
      .querySelectorAll("#tabbar a, #nav a")
      .forEach((a) => a.classList.toggle("active",
        (top && a.dataset.route === top.route) || a.dataset.route === hash));
  }

  function route() {
    const { view, params, hash } = currentRoute();
    if (activeView && activeView.destroy) activeView.destroy();
    activeView = view;
    const el = document.getElementById("view");
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "";
    view.render(el, params);
    highlightNav(hash);
    document.getElementById("main").scrollTop = 0;
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);

  if (Store.getSettings().reduceMotion)
    document.body.classList.add("reduce-motion");

  renderNav();
  route();

  // PWA : service worker
  if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
    navigator.serviceWorker.register("sw.js").catch(() => {});
})();
