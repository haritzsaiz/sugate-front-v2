import { useState, useMemo } from 'react'
import { type Project } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { type BudgetSection, type BudgetConcept } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  Plus,
  Save,
  Trash2,
  GripVertical,
  Receipt,
  Calculator,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Percent,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BudgetPreview } from './budget-preview'

interface BudgetEditorProps {
  project: Project
  client: Client | null
  onSaveBudgetDetails: (updatedBudgetDetails: BudgetSection[]) => void
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function BudgetEditor({ project, client, onSaveBudgetDetails }: BudgetEditorProps) {
  const [sections, setSections] = useState<BudgetSection[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [taxRate, setTaxRate] = useState(21)
  const [discountRate, setDiscountRate] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = sections.reduce((total, section) => {
      return total + section.concepts.reduce((sectionSum, concept) => sectionSum + concept.cost, 0)
    }, 0)
    const discount = subtotal * (discountRate / 100)
    const taxableAmount = subtotal - discount
    const tax = taxableAmount * (taxRate / 100)
    const total = taxableAmount + tax
    const totalConcepts = sections.reduce((sum, s) => sum + s.concepts.length, 0)

    return { subtotal, discount, taxableAmount, tax, total, totalConcepts }
  }, [sections, taxRate, discountRate])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const addSection = () => {
    const newSection: BudgetSection = {
      id: generateId(),
      name: '',
      concepts: [],
    }
    setSections((prev) => [...prev, newSection])
    setExpandedSections((prev) => new Set([...prev, newSection.id]))
  }

  const updateSection = (sectionId: string, updates: Partial<BudgetSection>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    )
  }

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId))
    toast.success('Sección eliminada')
  }

  const duplicateSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section) {
      const newSection: BudgetSection = {
        ...section,
        id: generateId(),
        name: `${section.name} (copia)`,
        concepts: section.concepts.map((c) => ({ ...c, id: generateId() })),
      }
      setSections((prev) => [...prev, newSection])
      setExpandedSections((prev) => new Set([...prev, newSection.id]))
      toast.success('Sección duplicada')
    }
  }

  const addConcept = (sectionId: string) => {
    const newConcept: BudgetConcept = {
      id: generateId(),
      referencia: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      cost: 0,
    }
    updateSection(sectionId, {
      concepts: [
        ...sections.find((s) => s.id === sectionId)!.concepts,
        newConcept,
      ],
    })
  }

  const updateConcept = (
    sectionId: string,
    conceptId: string,
    updates: Partial<BudgetConcept>
  ) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          concepts: section.concepts.map((concept) => {
            if (concept.id !== conceptId) return concept
            const updated = { ...concept, ...updates }
            // Auto-calculate cost when quantity or unitPrice changes
            if ('quantity' in updates || 'unitPrice' in updates) {
              updated.cost = updated.quantity * updated.unitPrice
            }
            return updated
          }),
        }
      })
    )
  }

  const deleteConcept = (sectionId: string, conceptId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        return {
          ...section,
          concepts: section.concepts.filter((c) => c.id !== conceptId),
        }
      })
    )
  }

  const handleSave = () => {
    // Validation
    const emptySections = sections.filter((s) => !s.name.trim())
    if (emptySections.length > 0) {
      toast.error('Todas las secciones deben tener un nombre')
      return
    }

    const invalidConcepts = sections.some((s) =>
      s.concepts.some((c) => !c.description.trim() || c.cost < 0)
    )
    if (invalidConcepts) {
      toast.error('Todos los conceptos deben tener una descripción y un coste válido')
      return
    }

    onSaveBudgetDetails(sections)
    toast.success('Presupuesto guardado correctamente')
  }

  const getSectionTotal = (section: BudgetSection) => {
    return section.concepts.reduce((sum, c) => sum + c.cost, 0)
  }

  return (
    <div className='space-y-6'>
      {/* Header Card */}
      <Card className='overflow-hidden border-none shadow-md'>
        <div className='bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20'>
                <Receipt className='h-6 w-6' />
              </div>
              <div>
                <h2 className='text-xl font-semibold'>Presupuesto</h2>
                <p className='text-sm opacity-90'>{project.direccion}</p>
                {client && (
                  <p className='text-sm opacity-75'>
                    Cliente: {client.nombre_completo}
                  </p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {sections.length > 0 && (
                <Button
                  variant='secondary'
                  size='sm'
                  className='gap-2'
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className='h-4 w-4' />
                  Vista Previa
                </Button>
              )}
              <Button
                onClick={handleSave}
                variant='secondary'
                className='gap-2'
              >
                <Save className='h-4 w-4' />
                Guardar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className='grid grid-cols-2 divide-x border-t sm:grid-cols-4'>
          <div className='p-4 text-center'>
            <p className='text-2xl font-bold'>{sections.length}</p>
            <p className='text-xs text-muted-foreground'>Secciones</p>
          </div>
          <div className='p-4 text-center'>
            <p className='text-2xl font-bold'>{calculations.totalConcepts}</p>
            <p className='text-xs text-muted-foreground'>Conceptos</p>
          </div>
          <div className='p-4 text-center'>
            <p className='text-2xl font-bold text-primary'>
              {formatCurrency(calculations.subtotal)}
            </p>
            <p className='text-xs text-muted-foreground'>Subtotal</p>
          </div>
          <div className='p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {formatCurrency(calculations.total)}
            </p>
            <p className='text-xs text-muted-foreground'>Total con IVA</p>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {sections.length === 0 && (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
              <FileText className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>Sin secciones</h3>
            <p className='mb-6 max-w-sm text-center text-sm text-muted-foreground'>
              Comienza añadiendo una sección para organizar los conceptos del presupuesto.
            </p>
            <Button onClick={addSection} className='gap-2'>
              <Plus className='h-4 w-4' />
              Añadir primera sección
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className='space-y-4'>
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id)
          const sectionTotal = getSectionTotal(section)

          return (
            <Card key={section.id} className='overflow-hidden'>
              <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                <div className='flex items-center gap-2 border-b bg-muted/30 p-3'>
                  <GripVertical className='h-4 w-4 cursor-grab text-muted-foreground' />
                  <CollapsibleTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <Badge variant='outline' className='font-mono text-xs'>
                    {sectionIndex + 1}
                  </Badge>

                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    placeholder='Nombre de la sección...'
                    className='h-8 flex-1 border-none bg-transparent font-medium shadow-none focus-visible:ring-0'
                  />

                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='font-mono'>
                      {section.concepts.length} items
                    </Badge>
                    <Badge className='font-mono'>
                      {formatCurrency(sectionTotal)}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => duplicateSection(section.id)}>
                          <Copy className='mr-2 h-4 w-4' />
                          Duplicar sección
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() => deleteSection(section.id)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Eliminar sección
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className='p-0'>
                    <Table>
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='w-12'></TableHead>
                          <TableHead className='min-w-[200px]'>Concepto</TableHead>
                          <TableHead className='w-28'>Referencia</TableHead>
                          <TableHead className='w-24 text-right'>Cantidad</TableHead>
                          <TableHead className='w-32 text-right'>Precio/Ud</TableHead>
                          <TableHead className='w-32 text-right'>Importe</TableHead>
                          <TableHead className='w-12'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.concepts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className='h-24 text-center'>
                              <p className='text-sm text-muted-foreground'>
                                Sin conceptos. Añade el primero.
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          section.concepts.map((concept, conceptIndex) => (
                            <TableRow key={concept.id} className='group'>
                              <TableCell className='text-center text-muted-foreground'>
                                <span className='font-mono text-xs'>
                                  {sectionIndex + 1}.{conceptIndex + 1}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={concept.description}
                                  onChange={(e) =>
                                    updateConcept(section.id, concept.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder='Concepto...'
                                  className='h-8 border-none bg-transparent shadow-none focus-visible:bg-background focus-visible:ring-1'
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={concept.referencia}
                                  onChange={(e) =>
                                    updateConcept(section.id, concept.id, {
                                      referencia: e.target.value,
                                    })
                                  }
                                  placeholder='REF-001'
                                  className='h-8 border-none bg-transparent font-mono text-xs shadow-none focus-visible:bg-background focus-visible:ring-1'
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  value={concept.quantity}
                                  onChange={(e) =>
                                    updateConcept(section.id, concept.id, {
                                      quantity: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className='h-8 border-none bg-transparent text-right shadow-none focus-visible:bg-background focus-visible:ring-1'
                                  min={0}
                                  step={0.01}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  value={concept.unitPrice}
                                  onChange={(e) =>
                                    updateConcept(section.id, concept.id, {
                                      unitPrice: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className='h-8 border-none bg-transparent text-right shadow-none focus-visible:bg-background focus-visible:ring-1'
                                  min={0}
                                  step={0.01}
                                />
                              </TableCell>
                              <TableCell className='text-right font-mono font-medium'>
                                {formatCurrency(concept.cost)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                                  onClick={() => deleteConcept(section.id, concept.id)}
                                >
                                  <Trash2 className='h-4 w-4 text-destructive' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={7} className='p-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full gap-2 border border-dashed'
                              onClick={() => addConcept(section.id)}
                            >
                              <Plus className='h-4 w-4' />
                              Añadir concepto
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Add Section Button */}
      {sections.length > 0 && (
        <Button
          variant='outline'
          className='w-full gap-2 border-dashed'
          onClick={addSection}
        >
          <Plus className='h-4 w-4' />
          Añadir sección
        </Button>
      )}

      {/* Totals Card */}
      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calculator className='h-5 w-5' />
              Resumen
            </CardTitle>
            <CardDescription>Desglose de importes y totales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Section breakdown */}
              <div className='space-y-2'>
                {sections.map((section, index) => (
                  <div key={section.id} className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {index + 1}. {section.name || 'Sin nombre'}
                    </span>
                    <span className='font-mono'>{formatCurrency(getSectionTotal(section))}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className='flex items-center justify-between'>
                <span className='font-medium'>Subtotal</span>
                <span className='font-mono text-lg'>
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>

              {/* Discount */}
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>Descuento</span>
                  <div className='flex items-center gap-1'>
                    <Input
                      type='number'
                      value={discountRate}
                      onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                      className='h-8 w-16 text-right'
                      min={0}
                      max={100}
                      step={0.5}
                    />
                    <Percent className='h-4 w-4 text-muted-foreground' />
                  </div>
                </div>
                <span className='font-mono text-destructive'>
                  -{formatCurrency(calculations.discount)}
                </span>
              </div>

              {/* Tax */}
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>IVA</span>
                  <div className='flex items-center gap-1'>
                    <Input
                      type='number'
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className='h-8 w-16 text-right'
                      min={0}
                      max={100}
                      step={0.5}
                    />
                    <Percent className='h-4 w-4 text-muted-foreground' />
                  </div>
                </div>
                <span className='font-mono'>+{formatCurrency(calculations.tax)}</span>
              </div>

              <Separator />

              {/* Total */}
              <div className='flex items-center justify-between'>
                <span className='text-xl font-bold'>TOTAL</span>
                <span className='text-2xl font-bold text-primary'>
                  {formatCurrency(calculations.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <BudgetPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        project={project}
        client={client}
        sections={sections}
        calculations={calculations}
        taxRate={taxRate}
        discountRate={discountRate}
      />
    </div>
  )
}
