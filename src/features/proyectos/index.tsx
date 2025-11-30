import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getAllProjects } from '@/lib/project-service'
import { getAllClients } from '@/lib/client-service'
import { getAllOficinas } from '@/lib/oficina-service'
import { type Proyecto } from './data/schema'
import { ProyectosTable } from './components/proyectos-table'
import { ProyectosPrimaryButtons } from './components/proyectos-primary-buttons'

export function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [projectsData, clientsData, oficinasData] = await Promise.all([
        getAllProjects(),
        getAllClients(),
        getAllOficinas(),
      ])

      // Map client names and oficina colors to projects
      const projectsWithClientsAndOficinas = projectsData.map((project) => {
        const client = clientsData.find((c) => c._id === project.id_cliente)
        // Match oficina by id or nombre (oficina field stores the nombre)
        const oficina = oficinasData.find(
          (o) => o.id === project.oficina || o.nombre === project.oficina
        )
        return {
          ...project,
          cliente_nombre: client ? client.nombre_completo : undefined,
          oficina_color: oficina?.color,
        } as Proyecto
      })

      setProyectos(projectsWithClientsAndOficinas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Main Content */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Todos los Proyectos</h2>
            <p className='text-muted-foreground'>
              Vista unificada de todos los proyectos ({proyectos.length} registros)
            </p>
          </div>
          <ProyectosPrimaryButtons onRefresh={fetchData} />
        </div>

        {loading ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-muted-foreground'>Cargando proyectos...</p>
          </div>
        ) : error ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <ProyectosTable data={proyectos} />
        )}
      </Main>
    </>
  )
}
