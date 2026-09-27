/* ============================================================
   OpenSpotAuto — caméra & capture
   Flux getUserMedia (caméra arrière privilégiée), mesure de
   vivacité en continu, capture JPEG + métadonnées (horodatage,
   GPS, infos caméra). Mode `?mockcam` : flux synthétique animé
   pour tests sans caméra réelle.
   ============================================================ */

const Cam = (() => {
  let stream = null;
  let mockTimer = null;
  let mockCanvas = null;

  const isMock = () =>
    new URLSearchParams(location.search).has("mockcam");

  /* ---------- Flux ---------- */

  async function start(videoEl) {
    stop();
    if (isMock()) return startMock(videoEl);
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error("camera-unavailable");
    const attempts = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: true },
    ];
    let err = null;
    for (const c of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        videoEl.srcObject = stream;
        await videoEl.play();
        return stream;
      } catch (e) {
        err = e;
      }
    }
    throw err || new Error("camera-unavailable");
  }

  /* Flux synthétique animé (tests / démo sans caméra). */
  function startMock(videoEl) {
    mockCanvas = document.createElement("canvas");
    mockCanvas.width = 1280; mockCanvas.height = 720;
    const ctx = mockCanvas.getContext("2d");
    mockTimer = setInterval(() => {
      const t = Date.now() / 1000;
      const g = ctx.createLinearGradient(0, 0, 1280, 720);
      g.addColorStop(0, `hsl(${(t * 40) % 360},40%,25%)`);
      g.addColorStop(1, `hsl(${(t * 40 + 120) % 360},50%,35%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 90px monospace";
      ctx.fillText("MOCK CAM " + t.toFixed(1), 120, 360);
      ctx.fillStyle = `hsl(${(t * 120) % 360},80%,60%)`;
      ctx.fillRect(200 + ((t * 300) % 800), 480, 120, 60);
    }, 100);
    stream = mockCanvas.captureStream(10);
    videoEl.srcObject = stream;
    return videoEl.play().then(() => stream);
  }

  function stop() {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function settings() {
    if (!stream || isMock()) return {};
    const t = stream.getVideoTracks()[0];
    return t && t.getSettings ? t.getSettings() : {};
  }

  /* ---------- GPS ---------- */

  function getPosition(timeoutMs = 8000) {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({
            lat: +p.coords.latitude.toFixed(6),
            lng: +p.coords.longitude.toFixed(6),
            acc: Math.round(p.coords.accuracy),
          }),
        () => resolve(null),
        { timeout: timeoutMs, maximumAge: 15000 }
      );
    });
  }

  /* ---------- Capture ---------- */

  async function capture(videoEl) {
    const w = videoEl.videoWidth || 1280;
    const h = videoEl.videoHeight || 720;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(videoEl, 0, 0, w, h);

    const blob = await new Promise((r) =>
      c.toBlob(r, "image/jpeg", 0.88)
    );
    if (!blob) throw new Error("capture-failed");

    const phash = AntiCheat.dHash(c);
    const [gps, cam] = [await getPosition(), settings()];

    return {
      blob,
      phash,
      gps,
      meta: {
        w, h,
        camW: cam.width || null,
        camH: cam.height || null,
        facing: cam.facingMode || null,
        ua: navigator.userAgent,
        platform: navigator.platform || "",
        mock: isMock() || undefined,
      },
    };
  }

  return { start, stop, capture, getPosition, isMock };
})();
