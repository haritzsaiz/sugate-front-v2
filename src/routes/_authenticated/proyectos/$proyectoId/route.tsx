import { createFileRoute, Outlet, useNavigate, useParams, useLocation, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getProjectById } from '@/lib/project-service'
import { getClientById } from '@/lib/client-service'
import { type Project } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import { type ProjectStatus } from '@/features/proyectos/data/schema'
import { ProyectoStatusBadge } from '@/features/proyectos/components/proyecto-status-badge'
import { ProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId')({
  component: ProyectoDetailLayout,
})

function ProyectoDetailLayout() {
  const navigate = useNavigate()
  const { proyectoId } = useParams({ from: '/_authenticated/proyectos/$proyectoId' })
  const location = useLocation()
  const [proyecto, setProyecto] = useState<Project | null>(null)
  const [cliente, setCliente] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  // Determine active tab from URL
  const pathParts = location.pathname.split('/')
  const lastPart = pathParts[pathParts.length - 1]
  const tabs = ['resumen', 'detalles', 'ubicacion', 'presupuesto', 'facturacion', 'admin', 'fotos']
  const activeTab = tabs.includes(lastPart) ? lastPart : 'resumen'

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        const projectData = await getProjectById(proyectoId)
        if (projectData) {
          setProyecto(projectData)
          
          // Fetch client data
          const clientData = await getClientById(projectData.id_cliente)
          if (clientData) {
            setCliente(clientData)
          }
        } else {
          toast.error('Proyecto no encontrado')
          navigate({ to: '/proyectos' })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar el proyecto')
        navigate({ to: '/proyectos' })
      } finally {
        setLoading(false)
      }
    }

    fetchProyecto()
  }, [proyectoId, navigate])

  if (loading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='flex items-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Cargando proyecto...</span>
          </div>
        </Main>
      </>
    )
  }

  if (!proyecto) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <AlertCircle className='h-12 w-12 text-destructive' />
            <p className='text-lg font-medium'>Proyecto no encontrado</p>
            <Button onClick={() => navigate({ to: '/proyectos' })}>
              Volver a proyectos
            </Button>
          </div>
        </Main>
      </>
    )
  }

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
        {/* Page Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate({ to: '/proyectos' })}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{proyecto.direccion}</h1>
              <p className='text-muted-foreground'>{proyecto.ciudad}</p>
            </div>
          </div>
          <div className='mt-4 flex items-center gap-3'>
            <ProyectoStatusBadge status={proyecto.estado as ProjectStatus} />
            {cliente && (
              <span className='text-sm text-muted-foreground'>
                Cliente: <span className='font-medium'>{cliente.nombre_completo}</span>
              </span>
            )}
            {proyecto.id && (
              <span className='text-sm text-muted-foreground'>
                ID: <span className='font-mono text-xs'>{proyecto.id}</span>
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className='border-t' />

        {/* Sidebar Layout */}
        <div className='flex gap-6'>
          {/* Sidebar */}
          <div className='w-48 flex-shrink-0'>
            <div className='space-y-2'>
              <Link
                to='/proyectos/$proyectoId/resumen'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'resumen'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Resumen
              </Link>
              <Link
                to='/proyectos/$proyectoId/detalles'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'detalles'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Detalles
              </Link>
              <Link
                to='/proyectos/$proyectoId/ubicacion'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'ubicacion'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Ubicación
              </Link>
              <Link
                to='/proyectos/$proyectoId/presupuesto'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'presupuesto'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Presupuesto
              </Link>
              <Link
                to='/proyectos/$proyectoId/facturacion'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'facturacion'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Facturación
              </Link>
              <Link
                to='/proyectos/$proyectoId/admin'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Admin
              </Link>
              <Link
                to='/proyectos/$proyectoId/fotos'
                params={{ proyectoId }}
                className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeTab === 'fotos'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                Fotos
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1'>
            <ProyectoDetailContext.Provider value={{ proyecto, cliente, onProjectUpdate: setProyecto }}>
              <Outlet />
            </ProyectoDetailContext.Provider>
          </div>
        </div>
      </Main>
    </>
  )
}
