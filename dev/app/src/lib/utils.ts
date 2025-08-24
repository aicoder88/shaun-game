import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase } from './supabase'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique room code with collision detection
 * Retries up to 10 times if code already exists
 */
export async function generateRoomCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const maxRetries = 10
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Check if code already exists
    if (!supabase) {
      return code // If no database, just return the generated code
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .select('code')
      .eq('code', code)
      .single()
    
    // If no data found (404), the code is available
    if (error && error.code === 'PGRST116') {
      return code
    }
    
    // If other error, log and continue trying
    if (error && error.code !== 'PGRST116') {
      console.warn('Error checking room code:', error)
    }
    
    console.log(`Room code ${code} already exists, retrying...`)
  }
  
  throw new Error('Failed to generate unique room code after maximum retries')
}

/**
 * Generate a simple room code (non-async version for backwards compatibility)
 * @deprecated Use generateRoomCode() for collision detection
 */
export function generateSimpleRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}