import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getAllClients, type Client } from '@/lib/client-service'
import { ClientesDialogs } from './components/clientes-dialogs'
import { ClientesPrimaryButtons } from './components/clientes-primary-buttons'
import { ClientesProvider } from './components/clientes-provider'
import { ClientesTable } from './components/clientes-table'

export function Clientes() {
  const [clientes, setClientes] = useState<Client[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = async () => {
    try {
      setIsFetching(true)
      setError(null)
      const data = await getAllClients()
      setClientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes')
    } finally {
      setIsFetching(false)
      setIsInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return (
    <ClientesProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Clientes</h2>
            <p className='text-muted-foreground'>
              Gestiona la información de tus clientes.
            </p>
          </div>
          <ClientesPrimaryButtons />
        </div>
        {isInitialLoad ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-muted-foreground'>Cargando clientes...</p>
          </div>
        ) : error ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <ClientesTable data={clientes} isLoading={isFetching} />
        )}
      </Main>

      <ClientesDialogs />
    </ClientesProvider>
  )
}
