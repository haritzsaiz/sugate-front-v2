import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authService } from '@/lib/auth-service'

export const Route = createFileRoute('/auth/logout-callback')({
  component: LogoutCallback,
})

function LogoutCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await authService.signoutCallback()
        // Redirect to home or login page after logout
        window.location.href = '/'
      } catch (err) {
        console.error('Logout callback error:', err)
        setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <a href='/' className='text-primary hover:underline'>
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-muted-foreground'>Cerrando sesión...</p>
      </div>
    </div>
  )
}
