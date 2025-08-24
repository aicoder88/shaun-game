import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://soonbazonjtbikrbdpnx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25iYXpvbmp0YmlrcmJkcG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTIyOTYsImV4cCI6MjA3MTYyODI5Nn0._nexIXYgRSNm1dWVPF8P-vMNuuf2fWEUQez-_NzTJRo'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type { Database }