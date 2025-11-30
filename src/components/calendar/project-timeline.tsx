import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, type View, type Event, Views } from 'react-big-calendar'
import moment from 'moment'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { toast } from 'sonner'
import { Play, Clock, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

import { getAllProjects } from '@/lib/project-service'
import { getAllClients } from '@/lib/client-service'
import {
    type Proyecto,
    type ProjectStatus,
    projectStatusLabels,
} from '@/features/proyectos/data/schema'
import { ProyectoStatusBadge } from '@/features/proyectos/components/proyecto-status-badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import './calendar-style.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// Set Spanish locale
moment.locale('es');
const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)

// Status icons using Lucide icons (same as proyectos-columns.tsx)
const statusIcons: Record<ProjectStatus, React.ReactNode> = {
    presupuesto: <FileText className='h-3 w-3' />,
    planificacion: <Clock className='h-3 w-3' />,
    en_ejecucion: <Play className='h-3 w-3' />,
    finalizado: <CheckCircle className='h-3 w-3' />,
    cancelado: <XCircle className='h-3 w-3' />,
}

// Calendar event type
interface ProjectEvent extends Event {
    id: string
    proyecto: Proyecto
    clientName: string
}

// Convert Tailwind classes to CSS colors for calendar events
const eventColors: Record<ProjectStatus, { bg: string; border: string; text: string }> = {
    presupuesto: { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
    planificacion: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
    en_ejecucion: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
    finalizado: { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
    cancelado: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
}

export function ProjectTimeline() {
    const [projects, setProjects] = useState<Proyecto[]>([])
    const [clients, setClients] = useState<Map<string, string>>(new Map())
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<View>('month')
    const [date, setDate] = useState(new Date())

    // Fetch projects and clients
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const [projectsData, clientsData] = await Promise.all([
                    getAllProjects(),
                    getAllClients(),
                ])

                setProjects(projectsData || [])

                // Build client lookup map
                const clientMap = new Map<string, string>()
                for (const client of clientsData || []) {
                    clientMap.set(client._id, client.nombre_completo || `${client.nombre} ${client.apellido1 || ''} ${client.apellido2 || ''}`.trim())
                }
                setClients(clientMap)
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Error al cargar los proyectos')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Convert projects to calendar events
    const events: ProjectEvent[] = useMemo(() => {
        return projects
            .filter(project => {
                // Must have dates to display on calendar
                return project.prevision?.fecha_inicio
            })
            .map(project => {
                const startDate = new Date(project.prevision.fecha_inicio)
                const endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + (project.prevision.dias_ejecucion || 1))

                return {
                    id: project.id,
                    title: project.direccion || 'Sin dirección',
                    start: startDate,
                    end: endDate,
                    proyecto: project,
                    clientName: clients.get(project.id_cliente) || 'Cliente desconocido',
                }
            })
    }, [projects, clients])

    // Handle event drag and drop
    const handleEventDrop = useCallback(
        async ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
            const projectEvent = event as ProjectEvent
            const newStart = new Date(start)
            const newEnd = new Date(end)
            const diasEjecucion = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24))

            // Update local state optimistically
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectEvent.id
                        ? {
                            ...p,
                            prevision: {
                                fecha_inicio: newStart.toISOString().split('T')[0],
                                dias_ejecucion: diasEjecucion,
                            },
                        }
                        : p
                )
            )

            toast.info('Arrastra y suelta en modo vista previa. Los cambios no se guardan.', {
                description: 'Edita el proyecto para cambiar las fechas.',
            })
        },
        []
    )

    // Handle event resize
    const handleEventResize = useCallback(
        async ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
            const projectEvent = event as ProjectEvent
            const newStart = new Date(start)
            const newEnd = new Date(end)
            const diasEjecucion = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24))

            // Update local state optimistically
            setProjects(prev =>
                prev.map(p =>
                    p.id === projectEvent.id
                        ? {
                            ...p,
                            prevision: {
                                fecha_inicio: newStart.toISOString().split('T')[0],
                                dias_ejecucion: diasEjecucion,
                            },
                        }
                        : p
                )
            )

            toast.info('Arrastra y suelta en modo vista previa. Los cambios no se guardan.', {
                description: 'Edita el proyecto para cambiar las fechas.',
            })
        },
        []
    )

    // Navigate to project detail on click
    const handleSelectEvent = useCallback(
        (event: object) => {
            const projectEvent = event as ProjectEvent
            window.location.href = `/proyectos/${projectEvent.id}`
        },
        []
    )

    // Custom event styling
    const eventStyleGetter = useCallback((event: object) => {
        const projectEvent = event as ProjectEvent
        const status = projectEvent.proyecto.estado as ProjectStatus
        const colors = eventColors[status] || eventColors.presupuesto

        return {
            style: {
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                color: colors.text,
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 500,
            },
        }
    }, [])

    // Custom event component
    const EventComponent = useCallback(
        ({ event }: { event: object }) => {
            const projectEvent = event as ProjectEvent
            const status = projectEvent.proyecto.estado as ProjectStatus

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='flex flex-col truncate'>
                                <div className='flex items-center gap-1'>
                                    {statusIcons[status] || statusIcons.presupuesto}
                                    <span className='truncate font-medium'>{projectEvent.title}</span>
                                </div>
                                <span className='truncate text-[10px] opacity-80'>{projectEvent.clientName}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side='top' className='max-w-xs'>
                            <div className='space-y-1'>
                                <p className='font-semibold'>{projectEvent.title}</p>
                                <p className='text-xs text-muted-foreground'>{projectEvent.clientName}</p>
                                <ProyectoStatusBadge status={status} />
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        []
    )

    // Custom toolbar
    const CustomToolbar = useCallback(
        ({ label }: { label: string }) => {
            const goToBack = () => {
                setDate(prev => {
                    const newDate = new Date(prev)
                    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1)
                    else if (view === 'week') newDate.setDate(newDate.getDate() - 7)
                    else newDate.setDate(newDate.getDate() - 1)
                    return newDate
                })
            }

            const goToNext = () => {
                setDate(prev => {
                    const newDate = new Date(prev)
                    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1)
                    else if (view === 'week') newDate.setDate(newDate.getDate() + 7)
                    else newDate.setDate(newDate.getDate() + 1)
                    return newDate
                })
            }

            const goToToday = () => setDate(new Date())

            return (
                <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm' onClick={goToToday}>
                            Hoy
                        </Button>
                        <Button variant='ghost' size='icon' onClick={goToBack}>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='icon' onClick={goToNext}>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                        <span className='text-lg font-semibold capitalize'>{label}</span>
                    </div>

                    <Select value={view} onValueChange={(v) => setView(v as View)}>
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='month'>Mes</SelectItem>
                            <SelectItem value='week'>Semana</SelectItem>
                            <SelectItem value='day'>Día</SelectItem>
                            <SelectItem value='agenda'>Agenda</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )
        },
        [view]
    )

    if (loading) {
        return (
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <Skeleton className='h-9 w-24' />
                    <Skeleton className='h-9 w-32' />
                </div>
                <Skeleton className='h-[600px] w-full' />
            </div>
        )
    }

    return (
        <div className='project-timeline'>
            <DnDCalendar
                localizer={localizer}
                events={events}
                view={view}
                date={date}
                onNavigate={setDate}
                onView={setView}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: EventComponent,
                    toolbar: CustomToolbar,
                }}
                resizable
                selectable
                popup
                style={{ height: 600 }}
                views={[Views.MONTH, Views.WEEK,]}
                culture="es"
                messages={{
                    today: 'Hoy',
                    previous: 'Anterior',
                    next: 'Siguiente',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay proyectos en este rango',
                    showMore: (total) => `+ ${total} más`,
                }}
            />

            {/* Legend */}
            <div className='mt-4 flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3'>
                <span className='text-sm font-medium text-muted-foreground'>Estados:</span>
                {Object.keys(projectStatusLabels).map((status) => (
                    <ProyectoStatusBadge key={status} status={status as ProjectStatus} />
                ))}
            </div>
        </div>
    )
}
