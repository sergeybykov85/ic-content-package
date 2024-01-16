const cookies = {
  setCookie(name: string, value: string, expiryDateIdSec?: number): void {
    const newCookie = `${name}=${value}; samesite=strict; secure`
    const expiration = expiryDateIdSec ? `;max-age=${expiryDateIdSec}` : ''
    document.cookie = newCookie + expiration
  },
  getCookie(name: string): string | undefined {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1]
  },
  deleteCookie(name: string): void {
    document.cookie = `${name}=;max-age=-1`
  },
}

export default cookies
