import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(token?: string) {
  const cookieStore = await cookies()

  const options = {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value ?? null
      },
      set(name, value, options) {
        cookieStore.set(name, value, options)
      },
      remove(name, options) {
        cookieStore.delete(name, options)
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
