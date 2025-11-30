import { useState, useMemo, useEffect } from 'react'
import { type Project, type BudgetSection, type BudgetItem, type BudgetData } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { getBillingByProjectId } from '@/lib/billing-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Calculator,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Percent,
  Eye,
  Loader2,
  CheckCircle,
  FilePlus,
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
  onSaveBudgetDetails: (budgetData: BudgetData) => void
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
  const [taxRate, setTaxRate] = useState(21) // iva_aplicado
  const [discountRate, setDiscountRate] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [isNewBudget, setIsNewBudget] = useState(false)

  // Get the list of presupuestos from the project
  const presupuestos = project.presupuestos || []
  const approvedBudgetId = project.budget_id_aprobado

  // Load budget data when selection changes
  useEffect(() => {
    const loadBudgetData = async () => {
      setIsLoading(true)
      
      try {
        if (isNewBudget) {
          // Creating a new budget - start fresh
          setSections([])
          setTaxRate(21)
          setExpandedSections(new Set())
        } else if (selectedBudgetId) {
          // Load the selected budget from presupuestos
          const selectedBudget = presupuestos.find(p => p.id === selectedBudgetId)
          if (selectedBudget) {
            // Add IDs to sections and items if they don't have them
            const sectionsWithIds = (selectedBudget.secciones || []).map((section, sIdx) => ({
              ...section,
              id: section.id || `section-${sIdx}-${Date.now()}`,
              items: (section.items || []).map((item, iIdx) => ({
                ...item,
                id: item.id || `item-${sIdx}-${iIdx}-${Date.now()}`,
              })),
            }))
            setSections(sectionsWithIds)
            setTaxRate(selectedBudget.iva_aplicado || 21)
            // Expand all sections by default
            setExpandedSections(new Set(sectionsWithIds.map(s => s.id)))
          }
        } else if (presupuestos.length > 0) {
          // Auto-select the approved budget or the first one
          const budgetToSelect = approvedBudgetId 
            ? presupuestos.find(p => p.id === approvedBudgetId) || presupuestos[0]
            : presupuestos[0]
          setSelectedBudgetId(budgetToSelect.id)
        } else {
          // No presupuestos exist, try loading from billing service
          const billing = await getBillingByProjectId(project.id)
          if (billing?.presupuesto) {
            const sectionsWithIds = (billing.presupuesto.secciones || []).map((section, sIdx) => ({
              ...section,
              id: section.id || `section-${sIdx}-${Date.now()}`,
              items: (section.items || []).map((item, iIdx) => ({
                ...item,
                id: item.id || `item-${sIdx}-${iIdx}-${Date.now()}`,
              })),
            }))
            setSections(sectionsWithIds)
            setTaxRate(billing.presupuesto.iva_aplicado || 21)
            setExpandedSections(new Set(sectionsWithIds.map(s => s.id)))
          }
        }
      } catch (error) {
        console.error('Error loading budget data:', error)
        toast.error('Error al cargar los datos del presupuesto')
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgetData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, selectedBudgetId, isNewBudget, approvedBudgetId])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  // Handle budget selection change
  const handleBudgetChange = (value: string) => {
    if (value === 'new') {
      setIsNewBudget(true)
      setSelectedBudgetId(null)
    } else {
      setIsNewBudget(false)
      setSelectedBudgetId(value)
    }
  }

  // Calculate totals - mapped to Go model fields
  const calculations = useMemo(() => {
    const total_sin_iva = sections.reduce((total, section) => {
      return total + section.items.reduce((sectionSum, item) => sectionSum + item.precio, 0)
    }, 0)
    const discount = total_sin_iva * (discountRate / 100)
    const taxableAmount = total_sin_iva - discount
    const iva_importe = taxableAmount * (taxRate / 100)
    const total_con_iva = taxableAmount + iva_importe
    const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)

    return { 
      total_sin_iva, 
      discount, 
      taxableAmount, 
      iva_importe, 
      total_con_iva, 
      totalItems,
      // Aliases for backward compatibility
      subtotal: total_sin_iva,
      tax: iva_importe,
      total: total_con_iva,
      totalConcepts: totalItems,
    }
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
      titulo: '',
      items: [],
      subtotal: 0,
    }
    setSections((prev) => [...prev, newSection])
    setExpandedSections((prev) => new Set([...prev, newSection.id]))
  }

  const updateSection = (sectionId: string, updates: Partial<BudgetSection>) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        const updated = { ...section, ...updates }
        // Recalculate subtotal when items change
        updated.subtotal = updated.items.reduce((sum, item) => sum + item.precio, 0)
        return updated
      })
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
        titulo: `${section.titulo} (copia)`,
        items: section.items.map((item) => ({ ...item, id: generateId() })),
      }
      setSections((prev) => [...prev, newSection])
      setExpandedSections((prev) => new Set([...prev, newSection.id]))
      toast.success('Sección duplicada')
    }
  }

  const addItem = (sectionId: string) => {
    const newItem: BudgetItem = {
      id: generateId(),
      titulo: '',
      precio: 0,
    }
    const section = sections.find((s) => s.id === sectionId)
    if (section) {
      updateSection(sectionId, {
        items: [...section.items, newItem],
      })
    }
  }

  const updateItem = (
    sectionId: string,
    itemId: string,
    updates: Partial<BudgetItem>
  ) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        const updatedItems = section.items.map((item) => {
          if (item.id !== itemId) return item
          return { ...item, ...updates }
        })
        return {
          ...section,
          items: updatedItems,
          subtotal: updatedItems.reduce((sum, item) => sum + item.precio, 0),
        }
      })
    )
  }

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section
        const updatedItems = section.items.filter((item) => item.id !== itemId)
        return {
          ...section,
          items: updatedItems,
          subtotal: updatedItems.reduce((sum, item) => sum + item.precio, 0),
        }
      })
    )
  }

  const handleSave = () => {
    // Validation
    const emptySections = sections.filter((s) => !s.titulo.trim())
    if (emptySections.length > 0) {
      toast.error('Todas las secciones deben tener un nombre')
      return
    }

    const invalidItems = sections.some((s) =>
      s.items.some((item) => !item.titulo.trim() || item.precio < 0)
    )
    if (invalidItems) {
      toast.error('Todos los items deben tener un título y un precio válido')
      return
    }

    // Build BudgetData object matching Go model
    const budgetData: BudgetData = {
      id: generateId(),
      created_at: new Date().toISOString(),
      total_sin_iva: calculations.total_sin_iva,
      iva_aplicado: taxRate,
      iva_importe: calculations.iva_importe,
      total_con_iva: calculations.total_con_iva,
      secciones: sections.map((section) => ({
        id: section.id,
        titulo: section.titulo,
        items: section.items.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          precio: item.precio,
        })),
        subtotal: section.subtotal,
      })),
    }

    onSaveBudgetDetails(budgetData)
  }

  const getSectionTotal = (section: BudgetSection) => {
    return section.items.reduce((sum, item) => sum + item.precio, 0)
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-2 text-muted-foreground'>Cargando presupuesto...</span>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold'>
              {isNewBudget ? 'Nuevo Presupuesto' : 'Presupuesto'}
            </h2>
            {selectedBudgetId === approvedBudgetId && !isNewBudget && (
              <Badge variant='default' className='bg-green-600 text-xs'>
                <CheckCircle className='mr-1 h-3 w-3' />
                Aprobado
              </Badge>
            )}
          </div>
          <p className='text-sm text-muted-foreground'>Desglose de conceptos y costes del proyecto</p>
        </div>
        <div className='flex items-center gap-2'>
          {sections.length > 0 && (
            <Button
              variant='outline'
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
            size='sm'
            className='gap-2'
          >
            <Save className='h-4 w-4' />
            Guardar
          </Button>
        </div>
      </div>

      {/* Budget Selector */}
      {presupuestos.length > 0 && (
        <div className='flex items-center gap-3'>
          <Select
            value={isNewBudget ? 'new' : (selectedBudgetId || '')}
            onValueChange={handleBudgetChange}
          >
            <SelectTrigger className='w-[380px]'>
              <SelectValue placeholder='Selecciona un presupuesto' />
            </SelectTrigger>
            <SelectContent>
              {presupuestos.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  <div className='flex items-center gap-2'>
                    {budget.id === approvedBudgetId && (
                      <CheckCircle className='h-4 w-4 shrink-0 text-green-600' />
                    )}
                    <span className='truncate'>
                      {formatCurrency(budget.total_con_iva)} - {formatDate(budget.created_at)}
                    </span>
                    {budget.id === approvedBudgetId && (
                      <Badge variant='default' className='shrink-0 bg-green-600 text-xs'>
                        Aprobado
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value='new'>
                <div className='flex items-center gap-2 text-primary'>
                  <FilePlus className='h-4 w-4' />
                  <span>Crear nuevo presupuesto</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <span className='text-xs text-muted-foreground'>
            {presupuestos.length} presupuesto{presupuestos.length !== 1 ? 's' : ''} disponible{presupuestos.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Stats Bar */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold'>{sections.length}</p>
          <p className='text-xs text-muted-foreground'>Secciones</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold'>{calculations.totalConcepts}</p>
          <p className='text-xs text-muted-foreground'>Conceptos</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold text-primary'>
            {formatCurrency(calculations.subtotal)}
          </p>
          <p className='text-xs text-muted-foreground'>Subtotal</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold text-green-600'>
            {formatCurrency(calculations.total)}
          </p>
          <p className='text-xs text-muted-foreground'>Total con IVA</p>
        </div>
      </div>

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
                    value={section.titulo}
                    onChange={(e) => updateSection(section.id, { titulo: e.target.value })}
                    placeholder='Nombre de la sección...'
                    className='h-8 flex-1 border-none bg-transparent font-medium shadow-none focus-visible:ring-0'
                  />

                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='font-mono'>
                      {section.items.length} items
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
                          <TableHead className='min-w-[200px]'>Título</TableHead>
                          <TableHead className='w-32 text-right'>Precio</TableHead>
                          <TableHead className='w-12'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className='h-24 text-center'>
                              <p className='text-sm text-muted-foreground'>
                                Sin items. Añade el primero.
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          section.items.map((item, itemIndex) => (
                            <TableRow key={item.id} className='group'>
                              <TableCell className='text-center text-muted-foreground'>
                                <span className='font-mono text-xs'>
                                  {sectionIndex + 1}.{itemIndex + 1}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.titulo}
                                  onChange={(e) =>
                                    updateItem(section.id, item.id, {
                                      titulo: e.target.value,
                                    })
                                  }
                                  placeholder='Título del item...'
                                  className='h-8 border-none bg-transparent shadow-none focus-visible:bg-background focus-visible:ring-1'
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type='number'
                                  value={item.precio}
                                  onChange={(e) =>
                                    updateItem(section.id, item.id, {
                                      precio: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className='h-8 border-none bg-transparent text-right shadow-none focus-visible:bg-background focus-visible:ring-1'
                                  min={0}
                                  step={0.01}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                                  onClick={() => deleteItem(section.id, item.id)}
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
                          <TableCell colSpan={4} className='p-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full gap-2 border border-dashed'
                              onClick={() => addItem(section.id)}
                            >
                              <Plus className='h-4 w-4' />
                              Añadir item
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

      {/* Totals Section */}
      {sections.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Calculator className='h-4 w-4 text-muted-foreground' />
            <h3 className='text-sm font-medium'>Resumen</h3>
          </div>
          <div className='rounded-lg border bg-card p-4'>
            <div className='space-y-4'>
              {/* Section breakdown */}
              <div className='space-y-2'>
                {sections.map((section, index) => (
                  <div key={section.id} className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {index + 1}. {section.titulo || 'Sin nombre'}
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
          </div>
        </div>
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
