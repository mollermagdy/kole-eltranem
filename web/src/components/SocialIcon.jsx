import { siFacebook, siInstagram, siWhatsapp, siYoutube } from 'simple-icons'

const ICONS = { youtube: siYoutube, facebook: siFacebook, instagram: siInstagram, whatsapp: siWhatsapp }

export default function SocialIcon({ id, className }) {
  const icon = ICONS[id]
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={icon.path} />
    </svg>
  )
}
