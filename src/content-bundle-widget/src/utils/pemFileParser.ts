const HEADER = '-----BEGIN EC PRIVATE KEY-----'
const FOOTER = '-----END EC PRIVATE KEY-----'

const ERROR = `Invalid PEM file structure. File should contain:\n
${HEADER}
<private key>
${FOOTER}`

export default function pemFileParser(pemText: string): string {
  const text = pemText.trim().replace(/\r?\n|\r|\n/g, '')
  const headerIndex = text.indexOf(HEADER)
  const footerIndex = text.indexOf(FOOTER)
  if (headerIndex < 0 || footerIndex < headerIndex + HEADER.length) {
    throw new Error(ERROR)
  }
  const key = text.slice(headerIndex + HEADER.length, footerIndex)
  if (!key.length) {
    throw new Error(ERROR)
  }
  return key
}
