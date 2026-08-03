import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';

export const locales = ['ar', 'en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** `en` is the reference shape — ar/fr must match it or TypeScript complains. */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  ar: ar as Dictionary,
  en,
  fr: fr as Dictionary,
};

/** BCP-47 tags for `<html lang>`, hreflang and date formatting. */
export const htmlLang: Record<Locale, string> = {
  ar: 'ar-EG',
  en: 'en',
  fr: 'fr',
};

export const direction: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Reads the locale out of `/ar/products/...`, falling back to the default. */
export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  return isLocale(maybeLocale) ? maybeLocale : defaultLocale;
}

export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Builds a locale-prefixed, trailing-slash path.
 * `localizePath('/products', 'en')` → `/en/products/`
 */
export function localizePath(path: string, locale: Locale): string {
  const [rawPath, hash] = path.split('#');
  const clean = rawPath.replace(/^\/+|\/+$/g, '');
  const base = clean ? `/${locale}/${clean}/` : `/${locale}/`;
  return hash ? `${base}#${hash}` : base;
}

/**
 * Given the current URL, returns the equivalent path in another locale —
 * used by the language switcher and by the hreflang alternates.
 */
export function switchLocalePath(url: URL, target: Locale): string {
  const segments = url.pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return localizePath(segments.join('/'), target);
}

/** Locale-aware date formatting for blog posts. Uses Gregorian months in Arabic. */
export function formatDate(date: string, locale: Locale): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-EG-u-ca-gregory' : htmlLang[locale],
    { year: 'numeric', month: 'long', day: 'numeric' }
  ).format(parsed);
}
