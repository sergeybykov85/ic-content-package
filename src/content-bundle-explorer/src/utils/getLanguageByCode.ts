import locales from '~/assets/locales.json'

const LOCALES = locales as Record<string, string>

export default function getLanguageByCode(code: string): string {
  return LOCALES[code] || code
}
