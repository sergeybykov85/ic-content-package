import countries from '~/assets/countries.json'

const COUNTRIES = countries as Record<string, string>

export default function getCountryByCode(code: string): string {
  return COUNTRIES[code] || code
}
