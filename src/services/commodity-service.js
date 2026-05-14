window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.commodity = {
  dictionary: window.SEO_DATA.COMMODITY_DICTIONARY || [],

  normalizeKey(name) {
    return String(name || "")
      .trim()
      .replace(/\u00a0/g, " ")
      .replace(/[إأآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ھ/g, "ه")
      .replace(/[،,]/g, " ")
      .replace(/&/g, " and ")
      .replace(/[()]/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
  },

  getCommodityByAlias(name) {
    const key = this.normalizeKey(name);
    if (!key) return null;
    return this.dictionary.find((item) =>
      [item.canonicalEnglishName, item.canonicalArabicName, item.displayName, ...(item.aliases || [])]
        .some((alias) => this.normalizeKey(alias) === key)
    ) || null;
  },

  normalizeCommodityName(name) {
    const rawName = String(name || "").trim();
    const commodity = this.getCommodityByAlias(rawName);
    if (!commodity) {
      return {
        status: "unmapped",
        rawCommodityName: rawName,
        commodityId: null,
        commodityName: rawName,
        displayName: rawName,
        commodityCanonicalEnglishName: null,
        commodityCanonicalArabicName: null,
      };
    }
    return {
      status: "mapped",
      rawCommodityName: rawName,
      commodityId: commodity.commodityId,
      commodityName: commodity.displayName || commodity.canonicalArabicName || commodity.canonicalEnglishName,
      displayName: commodity.displayName || commodity.canonicalArabicName || commodity.canonicalEnglishName,
      commodityCanonicalEnglishName: commodity.canonicalEnglishName,
      commodityCanonicalArabicName: commodity.canonicalArabicName,
    };
  },

  applyCommodityNormalizationToObservation(observation) {
    const raw = observation.rawCommodityName || observation.commodityName;
    const normalized = this.normalizeCommodityName(raw);
    return {
      ...observation,
      rawCommodityName: observation.rawCommodityName || normalized.rawCommodityName,
      commodityId: normalized.commodityId || observation.commodityId,
      commodityName: normalized.commodityName || observation.commodityName,
      commodityCanonicalEnglishName: normalized.commodityCanonicalEnglishName,
      commodityCanonicalArabicName: normalized.commodityCanonicalArabicName,
      commodityNormalizationStatus: normalized.status,
    };
  },
};
