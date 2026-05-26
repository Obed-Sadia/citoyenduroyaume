import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=link_expired`)
      }
      return NextResponse.redirect(`${origin}/`)
    } catch (error) {
      console.error('[auth/callback] exception:', error)
      return NextResponse.redirect(`${origin}/login?error=link_expired`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
