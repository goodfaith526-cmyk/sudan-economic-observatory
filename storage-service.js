window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.storage = {
  clone(value) {
    return JSON.parse(JSON.stringify(value));
  },

  getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
