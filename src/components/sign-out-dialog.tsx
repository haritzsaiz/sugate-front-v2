import { authService } from '@/lib/auth-service'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const handleSignOut = async () => {
    try {
      await authService.signoutRedirect()
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Cerrar sesión'
      desc='¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.'
      confirmText='Cerrar sesión'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
