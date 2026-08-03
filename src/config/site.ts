/**
 * Single place for company details and navigation structure.
 *
 * ⚠️ PLACEHOLDER DATA — every value marked below is dummy content standing in
 * for the client's real details. Replace these and the whole site updates.
 */

export const contact = {
  /** PLACEHOLDER */
  phone: '+20 100 000 0000',
  /** PLACEHOLDER — digits only, used to build the wa.me link */
  whatsapp: '201000000000',
  /** PLACEHOLDER */
  email: 'info@alfathgreen.com',
  /** PLACEHOLDER — address is localized in the i18n dictionaries where needed */
  address: {
    ar: 'دلتا النيل، جمهورية مصر العربية',
    en: 'Nile Delta, Arab Republic of Egypt',
    fr: 'Delta du Nil, République arabe d’Égypte',
  },
} as const;

export const whatsappUrl = `https://wa.me/${contact.whatsapp}`;

/** PLACEHOLDER social profiles — swap for the client's real accounts. */
export const social = [
  { name: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
  { name: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
  { name: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
  { name: 'WhatsApp', href: whatsappUrl, icon: 'whatsapp' },
] as const;

/**
 * Main navigation. `key` indexes into the `nav` object of the dictionaries;
 * `path` is the locale-less path handed to `localizePath()`.
 */
export const mainNav = [
  { key: 'about', path: '/#about' },
  { key: 'services', path: '/#services' },
  { key: 'products', path: '/products' },
  { key: 'blog', path: '/blog' },
  { key: 'contact', path: '/contact' },
] as const;

export const footerNav = [
  { key: 'home', path: '/' },
  { key: 'products', path: '/products' },
  { key: 'blog', path: '/blog' },
  { key: 'contact', path: '/contact' },
] as const;

export const foundedYear = 2026;
