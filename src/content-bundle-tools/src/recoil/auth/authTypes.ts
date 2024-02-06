export enum AUTH_TYPE {
  IC = 'ic',
  PEM = 'pem',
}

export const COOKIE_AUTH_TYPE_NAME = 'auth-type'
export const COOKIE_IDENTITY_NAME = 'identity'
export const AUTH_EXPIRATION_TIME = 60 * 60 * 24 // 1 day in sec
