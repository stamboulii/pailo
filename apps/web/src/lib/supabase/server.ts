import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClientOptions } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient(token?: string) {
  const cookieStore = await cookies()

  const options: SupabaseClientOptions<'public'> & {
    cookies: {
      get(name: string): string | null
      set(name: string, value: string, options: CookieOptions): void
      remove(name: string, options: CookieOptions): void
    }
  } = {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? null
      },
      set(name: string, value: string, opts: CookieOptions) {
        cookieStore.set({ name, value, ...opts })
      },
      remove(name: string, opts: CookieOptions) {
        cookieStore.set({ name, value: '', ...opts })
      }
    }
  }

  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  )
}
