import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OficinaBadgeProps {
  nombre: string
  color?: string
  className?: string
}

// Helper to check if oficina is Sugate
function isSugateOficina(nombre: string): boolean {
  return nombre.toLowerCase().includes('sugate')
}

// Helper to create a lighter version of a hex color
function getLighterColor(hex: string, opacity: number = 0.2): string {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function OficinaBadge({ nombre, color, className }: OficinaBadgeProps) {
  if (!nombre) {
    return <span className='text-muted-foreground'>-</span>
  }

  const isSugate = isSugateOficina(nombre)

  if (isSugate) {
    return (
      <Badge
        variant='outline'
        className={`flex w-fit items-center gap-1 bg-primary/10 text-primary border-primary/20 ${className ?? ''}`}
      >
        <img
          src='/images/sugate.png'
          alt='Sugate'
          className='h-3 w-3 object-contain'
        />
        {nombre}
      </Badge>
    )
  }

  if (color) {
    return (
      <Badge
        variant='outline'
        className={`flex w-fit items-center gap-1 ${className ?? ''}`}
        style={{
          backgroundColor: getLighterColor(color, 0.15),
          borderColor: getLighterColor(color, 0.3),
          color: color,
        }}
      >
        <Building2 className='h-3 w-3' />
        {nombre}
      </Badge>
    )
  }

  return (
    <Badge
      variant='outline'
      className={`flex w-fit items-center gap-1 bg-muted text-muted-foreground ${className ?? ''}`}
    >
      <Building2 className='h-3 w-3' />
      {nombre}
    </Badge>
  )
}
