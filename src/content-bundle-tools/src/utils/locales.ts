import localesRecords from '~/assets/locales.json'

const LOCALES = localesRecords as Record<string, string>

const locales = {
  getLanguageByCode: (code: string): string => LOCALES[code] || code,
  getCodeByLanguage: (language: string): string => Object.keys(LOCALES).find(key => LOCALES[key] === language) || language,
  getAllLanguages: (): string[] => Object.values(LOCALES)
}

export default locales
