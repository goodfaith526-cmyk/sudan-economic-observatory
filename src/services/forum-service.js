window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.forum = {
  key: "seo_forum_v2",

  defaultPosts: [
    { id: 1, title: "لماذا غياب التعداد السكاني يُعيق السياسات؟", body: "آخر تعداد 2008 — 17 عاماً. كيف تُخطط وزارة دون معرفة عدد السكان الحقيقي؟", author: "اقتصادي سوداني", topic: "gaps", time: "منذ يومين", likes: 14 },
    { id: 2, title: "الذهب السوداني: من يستفيد فعلاً؟", body: "100-150 طناً سنوياً، معظمها يغادر عبر قنوات غير رسمية دون أن تستفيد منه الخزينة.", author: "محلل اقتصادي", topic: "trade", time: "منذ 3 أيام", likes: 28 },
    { id: 3, title: "العجز التجاري تضاعف في 2025", body: "من 1.78 مليار في 2024 إلى 3.86 مليار في 2025. ضغط متصاعد على العملة والاحتياطيات.", author: "د. ناشط اقتصادي", topic: "macro", time: "منذ أسبوع", likes: 41 },
  ],

  loadPosts() {
    const saved = window.SEO_SERVICES.storage.getJSON(this.key, []);
    return saved && saved.length ? saved : window.SEO_SERVICES.storage.clone(this.defaultPosts);
  },

  savePosts(posts) {
    window.SEO_SERVICES.storage.setJSON(this.key, posts);
  },
};
