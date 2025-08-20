import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for MarketSentinel frontend
 * - getBackendUrl: returns backend URL from env
 * - apiFetch: fetch wrapper for backend API calls
 */
export function getBackendUrl(): string {
  return import.meta.env.VITE_BACKEND_URL || ''
}

export async function apiFetch(path: string, methodOrOptions?: string | RequestInit, body?: any) {
  const url = `${getBackendUrl()}${path}`
  let options: RequestInit

  if (typeof methodOrOptions === 'string') {
    options = {
      method: methodOrOptions,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }
  } else {
    options = methodOrOptions || {}
  }

  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
