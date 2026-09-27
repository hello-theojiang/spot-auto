/* ============================================================
   OpenSpotAuto — photos (IndexedDB)
   Stockage in-app des clichés capturés : les blobs restent dans
   la base locale pour un affichage permanent, sans serveur.
   ============================================================ */

const Photos = (() => {
  const DB = "openspotauto-photos";
  const STORE = "photos";
  let dbPromise = null;
  const urlCache = new Map();

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => {
          req.result.createObjectStore(STORE, { keyPath: "id" });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function put(id, blob) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ id, blob, createdAt: Date.now() });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getBlob(id) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  }

  async function del(id) {
    const d = await db();
    urlCache.delete(id);
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  /* URL objectURL mise en cache pour affichage <img>. */
  async function url(id) {
    if (urlCache.has(id)) return urlCache.get(id);
    const blob = await getBlob(id);
    if (!blob) return null;
    const u = URL.createObjectURL(blob);
    urlCache.set(id, u);
    return u;
  }

  return { put, getBlob, del, url };
})();
