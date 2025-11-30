import { Building2, Mail, MapPin, MoreVertical, Phone, Pencil, Trash2 } from 'lucide-react'
import type { Oficina } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useOficinas } from './oficinas-provider'

interface OficinasCardsProps {
  data: Oficina[]
  onRefresh: () => void
}

function isSugateOficina(nombre: string): boolean {
  return nombre.toLowerCase().includes('sugate')
}

// Helper to create a lighter version of a hex color
function getLighterColor(hex: string, opacity: number = 0.2): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function OficinasCards({ data, onRefresh: _onRefresh }: OficinasCardsProps) {
  const { setOpen, setCurrentRow } = useOficinas()

  const handleEdit = (oficina: Oficina) => {
    setCurrentRow(oficina)
    setOpen('update')
  }

  const handleDelete = (oficina: Oficina) => {
    setCurrentRow(oficina)
    setOpen('delete')
  }

  if (data.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-4 py-12'>
        <Building2 className='h-12 w-12 text-muted-foreground' />
        <div className='text-center'>
          <p className='text-lg font-medium'>No hay oficinas</p>
          <p className='text-muted-foreground'>
            Añade tu primera oficina para comenzar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {data.map((oficina) => {
        const isSugate = isSugateOficina(oficina.nombre)
        const borderStyle = oficina.color
          ? { borderColor: oficina.color, borderWidth: '2px' }
          : undefined

        return (
          <Card
            key={oficina.id}
            className='relative'
            style={borderStyle}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  {isSugate ? (
                    <div className='flex h-10 w-10 items-center justify-center rounded-md bg-primary'>
                      <img
                        src='/images/sugate.png'
                        alt='Sugate Logo'
                        className='h-8 w-8 object-contain'
                      />
                    </div>
                  ) : oficina.color ? (
                    <div
                      className='flex h-10 w-10 items-center justify-center rounded-md'
                      style={{ backgroundColor: getLighterColor(oficina.color, 0.2) }}
                    >
                      <Building2
                        className='h-5 w-5'
                        style={{ color: oficina.color }}
                      />
                    </div>
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-md bg-muted'>
                      <Building2 className='h-5 w-5 text-muted-foreground' />
                    </div>
                  )}
                  <div>
                    <CardTitle className='text-base'>{oficina.nombre}</CardTitle>
                    {oficina.direccion && (
                      <CardDescription className='line-clamp-1'>
                        {oficina.direccion}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-4 w-4' />
                      <span className='sr-only'>Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => handleEdit(oficina)}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(oficina)}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              {oficina.direccion && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <MapPin className='h-4 w-4 shrink-0' />
                  <span className='truncate'>{oficina.direccion}</span>
                </div>
              )}
              {oficina.telefono && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Phone className='h-4 w-4 shrink-0' />
                  <span>{oficina.telefono}</span>
                </div>
              )}
              {oficina.email && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Mail className='h-4 w-4 shrink-0' />
                  <span className='truncate'>{oficina.email}</span>
                </div>
              )}
              {!oficina.direccion && !oficina.telefono && !oficina.email && (
                <p className='text-sm text-muted-foreground italic'>
                  Sin información de contacto
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
