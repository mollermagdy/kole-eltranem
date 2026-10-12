// Converts the raw Figma PNG exports in assets-src/ to optimized WebP in src/assets/.
// Images listed in WHITE_TO_ALPHA get their white background turned into real transparency
// (GIMP-style "color to alpha"), so they sit cleanly on any background color.
//
//   npm run images

import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'assets-src'
const OUT = 'src/assets'
const WHITE_TO_ALPHA = new Set(['logo', 'hero-instruments'])
const MAX_WIDTH = { 'hero-instruments': 1800, 'cal-all-hymns': 1400, logo: 600 }

async function whiteToAlpha(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a0] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    const alpha = 255 - Math.min(r, g, b) // distance from white
    if (alpha === 0) {
      data[i + 3] = 0
      continue
    }
    const unmix = (c) => Math.round(255 - ((255 - c) * 255) / alpha)
    data[i] = unmix(r)
    data[i + 1] = unmix(g)
    data[i + 2] = unmix(b)
    data[i + 3] = Math.round((alpha * a0) / 255)
  }
  return sharp(data, { raw: info })
}

await mkdir(OUT, { recursive: true })
for (const f of await readdir(SRC)) {
  if (!f.endsWith('.png')) continue
  const name = path.basename(f, '.png')
  const input = path.join(SRC, f)
  let img = WHITE_TO_ALPHA.has(name) ? await whiteToAlpha(input) : sharp(input)
  if (MAX_WIDTH[name]) img = img.resize({ width: MAX_WIDTH[name], withoutEnlargement: true })
  const out = path.join(OUT, `${name}.webp`)
  const { size } = await img.webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(out)
  console.log(`${out}  ${(size / 1024).toFixed(0)} KB`)
}
