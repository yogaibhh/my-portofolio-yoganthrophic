import { profile } from './profile'

/* Contact links built from the profile, so the CV path, the WhatsApp number
   and the mailto encoding are written once rather than in every component
   that offers them.

   Not imported by scripts/routes.mjs: `import.meta.env` only exists inside
   Vite. */

export const CV_URL = `${import.meta.env.BASE_URL}${profile.cvFile}`

/* Null when no WhatsApp number is configured, so callers can skip the button
   instead of rendering a dead link. */
export function whatsappHref(text = '') {
  if (!profile.whatsapp) return null
  const base = `https://wa.me/${profile.whatsapp}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function mailtoHref({ subject = '', body = '' } = {}) {
  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${profile.email}${params.length ? `?${params.join('&')}` : ''}`
}
