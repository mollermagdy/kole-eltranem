/**
 * Normalizes Arabic text for forgiving search:
 * strips diacritics and tatweel, unifies alef / yaa / taa-marbuta / hamza forms.
 */
export function normalizeArabic(s = '') {
  return String(s)
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + superscript alef + tatweel
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')
    .toLowerCase()
    .trim()
}

const FIELDS = {
  title: (h) => [h.title, h.original, h.firstLine],
  writer: (h) => [h.writer],
  composer: (h) => [h.composer],
  maqam: (h) => [h.maqam],
  occasion: (h) => [h.occasion],
}

export function searchHymns(hymns, query, scope = 'all') {
  const q = normalizeArabic(query)
  if (!q) return []
  const pick = scope === 'all' ? (h) => Object.values(FIELDS).flatMap((f) => f(h)) : FIELDS[scope]
  return hymns.filter((h) => pick(h).some((v) => v && normalizeArabic(v).includes(q)))
}
