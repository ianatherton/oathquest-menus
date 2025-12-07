const DELIMITER = '|'
const VERSION = '1'

export interface OathHashData {
  habit: string
  preface: 'stop' | 'start'
  badge: string
  startDate: number
  length: 'forever' | number
}

const encodeUnicode = (str: string): string => { // handle emojis and unicode
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
}

const decodeUnicode = (str: string): string => {
  return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
}

export function generateOathHash(oath: OathHashData): string {
  const parts = [
    VERSION,
    oath.habit,
    oath.preface === 'stop' ? 's' : 'r',
    oath.badge,
    oath.startDate,
    oath.length === 'forever' ? 'f' : oath.length,
  ]
  const raw = parts.join(DELIMITER)
  return encodeUnicode(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') // URL-safe Base64
}

export function parseOathHash(hash: string): OathHashData | null {
  try {
    let b64 = hash.trim().replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const parts = decodeUnicode(b64).split(DELIMITER)
    if (parts[0] !== VERSION || parts.length !== 6) return null
    const startDate = parseInt(parts[4], 10)
    const lengthVal = parts[5]
    if (isNaN(startDate)) return null
    return {
      habit: parts[1],
      preface: parts[2] === 's' ? 'stop' : 'start',
      badge: parts[3],
      startDate,
      length: lengthVal === 'f' ? 'forever' : parseInt(lengthVal, 10),
    }
  } catch {
    return null
  }
}

