import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error)
    }
  }

  return NextResponse.redirect(`${url.origin}/`)
}
