/**
 * Cliente Supabase para el frontend (browser-side)
 * Usa anon key para suscripciones Realtime
 * NO usar para mutaciones directas - usar lib/api.js para eso
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null

export function getSupabaseClient() {
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }
  return supabase
}

export default getSupabaseClient
