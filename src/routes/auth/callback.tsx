import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authService } from '@/lib/auth-service'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await authService.signinCallback()
        navigate({ to: '/' })
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Error de autenticación')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <a href='/sign-in' className='text-primary hover:underline'>
            Volver a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <Loader2 className='mx-auto h-8 w-8 animate-spin text-muted-foreground' />
        <p className='mt-2 text-muted-foreground'>Completando autenticación...</p>
      </div>
    </div>
  )
}
