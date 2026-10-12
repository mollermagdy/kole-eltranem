const arNumber = new Intl.NumberFormat('ar-EG', { useGrouping: false })

/** Formats a number with Arabic-Indic digits, e.g. 4820 → ٤٨٢٠ */
export const toArabic = (n) => arNumber.format(n)
