import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { authService } from '@/lib/auth-service'

export const Route = createFileRoute('/auth/silent-callback')({
  component: SilentCallback,
})

function SilentCallback() {
  useEffect(() => {
    authService.getUserManager().signinSilentCallback()
  }, [])

  return null
}
