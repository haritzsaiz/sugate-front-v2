import { useEffect, useState } from 'react'
import { FolderKanban, Play, Euro, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { getAllProjects } from '@/lib/project-service'
import { getAllClients, type Client } from '@/lib/client-service'
import { type Proyecto } from './data/schema'
import { ProyectosTable } from './components/proyectos-table'
import { ProyectosPrimaryButtons } from './components/proyectos-primary-buttons'

export function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [clientes, setClientes] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [projectsData, clientsData] = await Promise.all([
        getAllProjects(),
        getAllClients(),
      ])
      setClientes(clientsData)
      
      // Map client names to projects
      const projectsWithClients = projectsData.map((project) => {
        const client = clientsData.find((c) => c._id === project.id_cliente)
        return {
          ...project,
          cliente_nombre: client ? client.nombre_completo : undefined,
        } as Proyecto
      })
      
      setProyectos(projectsWithClients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate stats
  const totalProyectos = proyectos.length
  const enEjecucion = proyectos.filter((p) => p.estado === 'en_ejecucion').length
  const finalizados = proyectos.filter((p) => p.estado === 'finalizado').length
  const tasaFinalizacion = totalProyectos > 0 ? Math.round((finalizados / totalProyectos) * 100) : 0

  // For now, we don't have billing info, so we'll show 0
  const facturacionTotal = 0

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
        {/* Stats Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='flex flex-row items-center justify-between space-y-0 pt-6'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Proyectos</p>
                <p className='text-2xl font-bold'>{totalProyectos}</p>
              </div>
              <FolderKanban className='h-4 w-4 text-muted-foreground' />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-row items-center justify-between space-y-0 pt-6'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>En Ejecución</p>
                <p className='text-2xl font-bold'>{enEjecucion}</p>
              </div>
              <Play className='h-4 w-4 text-muted-foreground' />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-row items-center justify-between space-y-0 pt-6'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Facturación Total</p>
                <p className='text-2xl font-bold'>
                  {facturacionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <Euro className='h-4 w-4 text-muted-foreground' />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-row items-center justify-between space-y-0 pt-6'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Tasa de Finalización</p>
                <p className='text-2xl font-bold'>{tasaFinalizacion}%</p>
              </div>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-blue-100 p-2'>
                  <FolderKanban className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h2 className='text-xl font-bold'>Todos los Proyectos</h2>
                  <p className='text-sm text-muted-foreground'>
                    Vista unificada de todos los proyectos ({proyectos.length} registros)
                  </p>
                </div>
              </div>
              <ProyectosPrimaryButtons onRefresh={fetchData} />
            </div>

            {loading ? (
              <div className='flex h-[400px] items-center justify-center'>
                <p className='text-muted-foreground'>Cargando proyectos...</p>
              </div>
            ) : error ? (
              <div className='flex h-[400px] items-center justify-center'>
                <p className='text-destructive'>{error}</p>
              </div>
            ) : (
              <ProyectosTable data={proyectos} />
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
