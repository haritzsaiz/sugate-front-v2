import { type Project, type BudgetSection } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Download, Printer } from 'lucide-react'
import { toast } from 'sonner'

interface BudgetPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  client: Client | null
  sections: BudgetSection[]
  calculations: {
    subtotalBruto: number
    totalDescuentos: number
    subtotalNeto: number
    ivaByRate: Record<number, number>
    totalIva: number
    total: number
    totalConcepts: number
    // Backward compatibility
    subtotal: number
    discount: number
    taxableAmount: number
    tax: number
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function BudgetPreview({
  open,
  onOpenChange,
  project,
  client,
  sections,
  calculations,
}: BudgetPreviewProps) {
  const getSectionTotal = (section: BudgetSection) => {
    return section.items.reduce((sum, item) => sum + item.precio, 0)
  }

  const handlePrint = () => {
    // Generate the same HTML structure with inline styles for print
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión')
      return
    }

    const sectionsHtml = sections.map((section, sectionIndex) => `
      <div style="margin-bottom: 24px;">
        <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; border-radius: 6px; background: #f3f4f6; padding: 12px 16px;">
          <span style="font-weight: 600;">${sectionIndex + 1}. ${section.titulo || 'Sin nombre'}</span>
          <span style="font-family: monospace; font-weight: 600;">${formatCurrency(getSectionTotal(section))}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #e5e5e5;">
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">Nº</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">Concepto</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">Ref.</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">Importe</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">Dto.</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">IVA %</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 500;">IVA €</th>
            </tr>
          </thead>
          <tbody>
            ${section.items.map((item, itemIndex) => {
              const itemNeto = item.precio - (item.descuento || 0)
              const itemIva = itemNeto * ((item.iva ?? 21) / 100)
              return `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-family: monospace; font-size: 14px; color: #6b7280;">${sectionIndex + 1}.${itemIndex + 1}</td>
                <td style="padding: 12px; font-size: 14px;">${item.titulo}</td>
                <td style="padding: 12px; font-size: 14px; color: #6b7280;">${item.referencia || '-'}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace; font-size: 14px; font-weight: 500;">${formatCurrency(item.precio)}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace; font-size: 14px;">${formatCurrency(item.descuento ?? 0)}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace; font-size: 14px;">${item.iva ?? 21}%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace; font-size: 14px; color: #6b7280;">${formatCurrency(itemIva)}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `).join('')

    const descuentoHtml = calculations.totalDescuentos > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #dc2626;">
        <span>Descuentos</span>
        <span style="font-family: monospace;">-${formatCurrency(calculations.totalDescuentos)}</span>
      </div>
    ` : ''

    const ivaDesgloseHtml = Object.entries(calculations.ivaByRate).map(([, amount]) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
        <span style="color: #6b7280;">IVA</span>
        <span style="font-family: monospace;">+${formatCurrency(amount)}</span>
      </div>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Presupuesto - ${project.direccion}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #1a1a1a;
              line-height: 1.5;
              max-width: 900px;
              margin: 0 auto;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div style="margin-bottom: 40px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #e5e5e5; padding-bottom: 24px;">
            <div>
              <h1 style="font-size: 28px; font-weight: 700; color: #2563eb; margin: 0;">SUGATE</h1>
              <p style="margin-top: 4px; font-size: 14px; color: #6b7280;">Gestión de Proyectos</p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 24px; font-weight: 600; color: #374151; margin: 0;">PRESUPUESTO</h2>
              <p style="margin-top: 4px; font-size: 14px; color: #6b7280;">${formatDate(new Date())}</p>
            </div>
          </div>

          <!-- Parties -->
          <div style="margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            <div>
              <h3 style="margin-bottom: 8px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Proyecto</h3>
              <p style="font-weight: 600; margin: 0;">${project.direccion}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">${project.ciudad}</p>
              ${project.oficina ? `<p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Oficina: ${project.oficina}</p>` : ''}
            </div>
            <div>
              <h3 style="margin-bottom: 8px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Cliente</h3>
              ${client ? `
                <p style="font-weight: 600; margin: 0;">${client.nombre_completo}</p>
                ${client.email ? `<p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">${client.email}</p>` : ''}
                ${client.telefono ? `<p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">${client.telefono}</p>` : ''}
              ` : '<p style="font-size: 14px; color: #6b7280; margin: 0;">Sin cliente asignado</p>'}
            </div>
          </div>

          <!-- Sections -->
          ${sectionsHtml}

          <!-- Summary -->
          <div style="margin-top: 40px; margin-left: auto; width: 320px; background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
              <span style="color: #6b7280;">Importe bruto</span>
              <span style="font-family: monospace;">${formatCurrency(calculations.subtotalBruto)}</span>
            </div>
            ${descuentoHtml}
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; font-weight: 500;">
              <span>Base imponible</span>
              <span style="font-family: monospace;">${formatCurrency(calculations.subtotalNeto)}</span>
            </div>
            <div style="border-top: 1px solid #e5e5e5; margin: 12px 0;"></div>
            ${ivaDesgloseHtml}
            <div style="border-top: 1px solid #e5e5e5; margin: 12px 0;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 700;">
              <span>TOTAL</span>
              <span style="color: #2563eb;">${formatCurrency(calculations.total)}</span>
            </div>
          </div>

          <!-- Terms -->
          <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #374151;">Condiciones</h4>
            <ul style="font-size: 13px; color: #6b7280; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 6px;">Presupuesto válido durante 30 días desde la fecha de emisión.</li>
              <li style="margin-bottom: 6px;">Los precios incluyen materiales y mano de obra salvo indicación contraria.</li>
              <li style="margin-bottom: 6px;">Forma de pago: 50% al inicio, 50% a la finalización de los trabajos.</li>
              <li style="margin-bottom: 6px;">Garantía de 2 años en todos los trabajos realizados.</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">Documento generado el ${formatDate(new Date())} · SUGATE</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportPDF = async () => {
    handlePrint()
    toast.success('Usa "Guardar como PDF" en el diálogo de impresión')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!max-h-[95vh] !max-w-[90vw] overflow-hidden p-0'>
        <DialogHeader className='border-b px-6 py-4 pr-14'>
          <div className='flex flex-row items-center justify-between'>
            <div>
              <DialogTitle>Vista Previa del Presupuesto</DialogTitle>
              <DialogDescription>
                Revisa el documento antes de exportar
              </DialogDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handlePrint}>
                <Printer className='mr-2 h-4 w-4' />
                Imprimir
              </Button>
              <Button size='sm' onClick={handleExportPDF}>
                <Download className='mr-2 h-4 w-4' />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[calc(95vh-80px)] overflow-auto bg-gray-100 p-8'>
          {/* Preview Document */}
          <div className='mx-auto max-w-5xl rounded-lg bg-white p-10 shadow-lg'>
            {/* Header */}
            <div className='mb-10 flex items-start justify-between border-b-2 border-gray-200 pb-6'>
              <div>
                <h1 className='text-3xl font-bold text-primary'>SUGATE</h1>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Gestión de Proyectos
                </p>
              </div>
              <div className='text-right'>
                <h2 className='text-2xl font-semibold text-gray-700'>PRESUPUESTO</h2>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {formatDate(new Date())}
                </p>
              </div>
            </div>

            {/* Parties */}
            <div className='mb-10 grid grid-cols-2 gap-10'>
              <div>
                <h3 className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Proyecto
                </h3>
                <p className='font-semibold'>{project.direccion}</p>
                <p className='text-sm text-muted-foreground'>{project.ciudad}</p>
                {project.oficina && (
                  <p className='text-sm text-muted-foreground'>
                    Oficina: {project.oficina}
                  </p>
                )}
              </div>
              <div>
                <h3 className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Cliente
                </h3>
                {client ? (
                  <>
                    <p className='font-semibold'>{client.nombre_completo}</p>
                    {client.email && (
                      <p className='text-sm text-muted-foreground'>{client.email}</p>
                    )}
                    {client.telefono && (
                      <p className='text-sm text-muted-foreground'>{client.telefono}</p>
                    )}
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>Sin cliente asignado</p>
                )}
              </div>
            </div>

            {/* Sections */}
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className='mb-6'>
                <div className='mb-2 flex items-center justify-between rounded-md bg-gray-100 px-4 py-3'>
                  <span className='font-semibold'>
                    {sectionIndex + 1}. {section.titulo || 'Sin nombre'}
                  </span>
                  <span className='font-mono font-semibold'>
                    {formatCurrency(getSectionTotal(section))}
                  </span>
                </div>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b text-xs uppercase text-muted-foreground'>
                      <th className='py-2 text-left font-medium'>Nº</th>
                      <th className='py-2 text-left font-medium'>Concepto</th>
                      <th className='py-2 text-left font-medium'>Ref.</th>
                      <th className='py-2 text-right font-medium'>Importe</th>
                      <th className='py-2 text-right font-medium'>Dto.</th>
                      <th className='py-2 text-right font-medium'>IVA %</th>
                      <th className='py-2 text-right font-medium'>IVA €</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, itemIndex) => {
                      const itemNeto = item.precio - (item.descuento || 0)
                      const itemIva = itemNeto * ((item.iva ?? 21) / 100)
                      return (
                        <tr key={item.id} className='border-b border-gray-100'>
                          <td className='py-3 font-mono text-sm text-muted-foreground'>
                            {sectionIndex + 1}.{itemIndex + 1}
                          </td>
                          <td className='py-3 text-sm'>{item.titulo}</td>
                          <td className='py-3 text-sm text-muted-foreground'>{item.referencia || '-'}</td>
                          <td className='py-3 text-right font-mono text-sm font-medium'>
                            {formatCurrency(item.precio)}
                          </td>
                          <td className='py-3 text-right font-mono text-sm'>
                            {formatCurrency(item.descuento ?? 0)}
                          </td>
                          <td className='py-3 text-right font-mono text-sm'>
                            {item.iva ?? 21}%
                          </td>
                          <td className='py-3 text-right font-mono text-sm text-muted-foreground'>
                            {formatCurrency(itemIva)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Summary */}
            <div className='ml-auto mt-10 w-80 rounded-lg bg-gray-50 p-5'>
              <div className='flex justify-between py-2 text-sm'>
                <span className='text-muted-foreground'>Importe bruto</span>
                <span className='font-mono'>{formatCurrency(calculations.subtotalBruto)}</span>
              </div>
              {calculations.totalDescuentos > 0 && (
                <div className='flex justify-between py-2 text-sm text-destructive'>
                  <span>Descuentos</span>
                  <span className='font-mono'>-{formatCurrency(calculations.totalDescuentos)}</span>
                </div>
              )}
              <div className='flex justify-between py-2 text-sm font-medium'>
                <span>Base imponible</span>
                <span className='font-mono'>{formatCurrency(calculations.subtotalNeto)}</span>
              </div>
              <Separator className='my-3' />
              {Object.entries(calculations.ivaByRate).map(([rate, amount]) => (
                <div key={rate} className='flex justify-between py-2 text-sm'>
                  <span className='text-muted-foreground'>IVA</span>
                  <span className='font-mono'>+{formatCurrency(amount)}</span>
                </div>
              ))}
              <Separator className='my-3' />
              <div className='flex justify-between text-xl font-bold'>
                <span>TOTAL</span>
                <span className='text-primary'>{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {/* Terms */}
            <div className='mt-10 rounded-lg bg-gray-50 p-5'>
              <h4 className='mb-3 font-semibold'>Condiciones</h4>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>• Presupuesto válido durante 30 días desde la fecha de emisión.</li>
                <li>• Los precios incluyen materiales y mano de obra salvo indicación contraria.</li>
                <li>• Forma de pago: 50% al inicio, 50% a la finalización de los trabajos.</li>
                <li>• Garantía de 2 años en todos los trabajos realizados.</li>
              </ul>
            </div>

            {/* Footer */}
            <div className='mt-10 border-t pt-5 text-center text-xs text-muted-foreground'>
              <p>Documento generado el {formatDate(new Date())} · SUGATE</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
