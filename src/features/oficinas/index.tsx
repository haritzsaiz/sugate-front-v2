import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getAllOficinas, type Oficina } from '@/lib/oficina-service'
import { OficinasDialogs } from './components/oficinas-dialogs'
import { OficinasCards } from './components/oficinas-cards'
import { OficinasProvider } from './components/oficinas-provider'
import { OficinasPrimaryButtons } from './components/oficinas-primary-buttons'

export function Oficinas() {
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOficinas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllOficinas()
      setOficinas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar oficinas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOficinas()
  }, [])

  return (
    <OficinasProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Oficinas</h2>
            <p className='text-muted-foreground'>
              Gestiona las oficinas de tu empresa.
            </p>
          </div>
          <OficinasPrimaryButtons />
        </div>
        {loading ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-muted-foreground'>Cargando oficinas...</p>
          </div>
        ) : error ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <OficinasCards data={oficinas} onRefresh={fetchOficinas} />
        )}
      </Main>

      <OficinasDialogs onRefresh={fetchOficinas} />
    </OficinasProvider>
  )
}

export { type Oficina } from '@/lib/oficina-service'
