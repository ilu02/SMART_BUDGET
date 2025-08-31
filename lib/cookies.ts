/**
 * Cookie utility functions for managing user-specific appearance settings
 */

export interface CookieOptions {
  expires?: Date | number;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return; // SSR safety

  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = false,
    sameSite = 'lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const expiresDate = expires instanceof Date ? expires : new Date(Date.now() + expires * 1000);
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // SSR safety

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = '/', domain?: string): void {
  if (typeof document === 'undefined') return; // SSR safety

  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {}; // SSR safety

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

/**
 * Set a JSON object as a cookie
 */
export function setJSONCookie(name: string, value: any, options: CookieOptions = {}): void {
  try {
    const jsonString = JSON.stringify(value);
    setCookie(name, jsonString, options);
  } catch (error) {
    console.error('Error setting JSON cookie:', error);
  }
}

/**
 * Get a JSON object from a cookie
 */
export function getJSONCookie<T = any>(name: string): T | null {
  try {
    const cookieValue = getCookie(name);
    if (!cookieValue) return null;
    return JSON.parse(cookieValue) as T;
  } catch (error) {
    console.error('Error parsing JSON cookie:', error);
    return null;
  }
}

/**
 * Generate a user-specific cookie name
 */
export function getUserCookieName(baseName: string, userId?: string): string {
  if (!userId) return baseName;
  return `${baseName}_${userId}`;
}

/**
 * Cookie settings for appearance preferences
 * Settings expire in 1 year and are accessible across the entire site
 */
export const APPEARANCE_COOKIE_OPTIONS: CookieOptions = {
  maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
};