import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useClientes } from './clientes-provider'

export function ClientesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClientes()
  return (
    <>
      {currentRow && (
        <ConfirmDialog
          key='cliente-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          handleConfirm={() => {
            setOpen(null)
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
            showSubmittedData(
              currentRow,
              'El siguiente cliente ha sido eliminado:'
            )
          }}
          className='max-w-md'
          title={`¿Eliminar cliente: ${currentRow.nombre} ${[currentRow.apellido1, currentRow.apellido2].filter(Boolean).join(' ')}?`}
          desc={
            <>
              Estás a punto de eliminar al cliente{' '}
              <strong>{currentRow.nombre} {[currentRow.apellido1, currentRow.apellido2].filter(Boolean).join(' ')}</strong>. <br />
              Esta acción no se puede deshacer.
            </>
          }
          confirmText='Eliminar'
        />
      )}
    </>
  )
}
