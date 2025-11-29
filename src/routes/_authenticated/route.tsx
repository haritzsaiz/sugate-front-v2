import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { authService } from '@/lib/auth-service'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const isAuthenticated = await authService.isAuthenticated()
    if (!isAuthenticated) {
      // Trigger login redirect
      await authService.signinRedirect()
      // Throw redirect to prevent rendering (signinRedirect navigates away)
      throw redirect({ to: '/' })
    }
  },
  component: AuthenticatedLayout,
})
