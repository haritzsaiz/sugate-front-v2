import { useState, useEffect, useMemo } from 'react'
import type { HitoFacturacion, BillingMilestoneStatus, BillingMilestoneAmountType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Pencil, Save, X, Percent, Euro, Check, Receipt, FileText } from 'lucide-react'

interface BillingMilestoneItemProps {
  milestone: HitoFacturacion
  budgetTotal: number
  onUpdate: (updatedMilestone: HitoFacturacion) => void
  onDelete: (milestoneId: string) => void
  onTicketBai?: (milestone: HitoFacturacion) => void
  isNew?: boolean
}

export function BillingMilestoneItem({
  milestone,
  budgetTotal,
  onUpdate,
  onDelete,
  onTicketBai,
  isNew = false,
}: BillingMilestoneItemProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [formData, setFormData] = useState(milestone)

  useEffect(() => {
    setFormData(milestone)
    setIsEditing(isNew)
  }, [milestone, isNew])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0

    let newTotal = 0
    if (formData.tipo_de_importe === 'porcentaje') {
      const percentage = Math.max(0, Math.min(100, value))
      newTotal = (budgetTotal * percentage) / 100
      setFormData((prev) => ({ ...prev, importe: percentage, total: newTotal }))
    } else {
      newTotal = Math.max(0, value)
      setFormData((prev) => ({ ...prev, importe: newTotal, total: newTotal }))
    }
  }

  const handleStatusChange = (status: BillingMilestoneStatus) => {
    setFormData((prev) => ({ ...prev, estado: status }))
  }

  const handleAmountTypeChange = (type: BillingMilestoneAmountType) => {
    let newImporte = 0
    let newTotal = 0
    if (type === 'porcentaje') {
      if (budgetTotal > 0) {
        newImporte = (formData.total / budgetTotal) * 100
      }
      newTotal = formData.total
    } else {
      newImporte = formData.total
      newTotal = formData.total
    }
    setFormData((prev) => ({
      ...prev,
      tipo_de_importe: type,
      importe: newImporte,
      total: newTotal,
    }))
  }

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      if (isNew) {
        onDelete(milestone.id)
      }
      return
    }
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (isNew) {
      onDelete(milestone.id)
    } else {
      setFormData(milestone)
      setIsEditing(false)
    }
  }

  const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })

  const displayAmount = useMemo(() => {
    return currencyFormatter.format(formData.total)
  }, [formData.total])

  const displayPercentage = useMemo(() => {
    if (budgetTotal > 0) {
      const percent = (formData.total / budgetTotal) * 100
      return percent.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
    }
    return 'N/A'
  }, [formData.total, budgetTotal])

  if (isEditing) {
    return (
      <div className='rounded-lg border bg-card p-4'>
        <div className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-sm font-medium'>Título del Hito</label>
            <Input
              name='nombre'
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder='Ej: 50% a la firma del contrato'
            />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium'>Tipo</label>
              <Select value={formData.tipo_de_importe} onValueChange={handleAmountTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='porcentaje'>Porcentaje</SelectItem>
                  <SelectItem value='euro'>Importe Fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium'>
                {formData.tipo_de_importe === 'porcentaje' ? 'Porcentaje' : 'Importe'}
              </label>
              <div className='flex items-center gap-2'>
                <Input
                  type='number'
                  value={formData.importe}
                  onChange={handleAmountChange}
                />
                {formData.tipo_de_importe === 'porcentaje' ? (
                  <Percent className='h-4 w-4 shrink-0 text-muted-foreground' />
                ) : (
                  <Euro className='h-4 w-4 shrink-0 text-muted-foreground' />
                )}
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium'>Estado</label>
              <Select value={formData.estado} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pendiente'>Pendiente</SelectItem>
                  <SelectItem value='facturado'>Factura emitida - Pdte. Cobro</SelectItem>
                  <SelectItem value='cobrado'>Cobrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center justify-between border-t pt-4'>
            <p className='text-sm text-muted-foreground'>
              Total: <span className='font-semibold'>{displayAmount}</span>
            </p>
            <div className='flex gap-2'>
              <Button variant='ghost' size='sm' onClick={handleCancel}>
                <X className='mr-1.5 h-4 w-4' />
                Cancelar
              </Button>
              <Button size='sm' onClick={handleSave}>
                <Save className='mr-1.5 h-4 w-4' />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50'>
      {/* Status indicator */}
      <div
        className={`h-3 w-3 shrink-0 rounded-full ${
          formData.estado === 'cobrado'
            ? 'bg-green-500'
            : formData.estado === 'facturado'
              ? 'bg-blue-500'
              : 'bg-amber-400'
        }`}
      />

      {/* Content */}
      <div className='flex flex-1 items-center justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='truncate font-medium'>{formData.nombre}</h4>
            <Badge
              variant='outline'
              className={`shrink-0 text-xs ${
                formData.estado === 'cobrado'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                  : formData.estado === 'facturado'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {formData.estado === 'cobrado' && <Check className='mr-1 h-3 w-3' />}
              {formData.estado === 'facturado' && <Receipt className='mr-1 h-3 w-3' />}
              {formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{displayPercentage} del presupuesto</p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-right'>
            <p className='text-lg font-bold'>{displayAmount}</p>
          </div>

          <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
            {onTicketBai &&
              formData.estado === 'pendiente' &&
              formData.nombre.trim() &&
              formData.total > 0 && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onTicketBai(formData)}
                  className='h-8 w-8'
                  title='Emitir con TicketBai'
                >
                  <FileText className='h-4 w-4' />
                </Button>
              )}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsEditing(true)}
              className='h-8 w-8'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => onDelete(milestone.id)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
