import { createClient } from '@/lib/supabase/server'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      try {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user && user.email) {
          // Sync user to database
          await authServer.syncUserToDatabase({
            id: user.id,
            email: user.email,
          })
        }
      } catch (syncError) {
        console.error('Failed to sync user to database:', syncError)
        // Continue with redirect even if sync fails
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}