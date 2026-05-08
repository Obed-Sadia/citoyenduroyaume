import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(`${origin}/`)
    } catch (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error)
      return NextResponse.redirect(`${origin}/login?error=link_expired`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
