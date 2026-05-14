window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.market = {
  key: "seo_mp_v1",

  loadItems(seedItems) {
    const saved = window.SEO_SERVICES.storage.getJSON(this.key, null);
    return saved && saved.length ? saved : window.SEO_SERVICES.storage.clone(seedItems);
  },

  saveItems(items) {
    window.SEO_SERVICES.storage.setJSON(this.key, items);
  },
};
