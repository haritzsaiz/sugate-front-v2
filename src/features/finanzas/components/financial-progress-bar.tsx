import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { FinancialRecord } from '../data/schema'

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function FinancialProgressBar({ record }: { record: FinancialRecord }) {
  const summary = useMemo(() => {
    const total = record.totalBudget
    const paid = record.paymentsReceived
    const outstanding = record.facturado
    const pendingInvoice = record.pendiente_factura
    const totalAssigned = paid + outstanding + pendingInvoice
    const unassigned = total - totalAssigned

    return { total, paid, outstanding, pendingInvoice, unassigned }
  }, [record])

  const progressBarData = useMemo(() => {
    const { total, paid, outstanding, pendingInvoice, unassigned } = summary
    if (total <= 0)
      return {
        paidPercent: 0,
        outstandingPercent: 0,
        pendingInvoicePercent: 0,
        unassignedPercent: 0,
        excessPercent: 0,
      }
    const paidPercent = (paid / total) * 100
    const outstandingPercent = (outstanding / total) * 100
    const pendingInvoicePercent = (pendingInvoice / total) * 100
    const unassignedPercent = unassigned > 0 ? (unassigned / total) * 100 : 0
    const excessPercent = unassigned < 0 ? (Math.abs(unassigned) / total) * 100 : 0
    return {
      paidPercent,
      outstandingPercent,
      pendingInvoicePercent,
      unassignedPercent,
      excessPercent,
    }
  }, [summary])

  // Show a muted bar when there's no budget
  if (summary.total <= 0) {
    return (
      <div className='relative flex h-3 w-full min-w-[120px] overflow-hidden rounded-full border bg-slate-200 dark:bg-slate-700'>
        <span className='text-muted-foreground absolute inset-0 flex items-center justify-center text-[8px]'>
          Sin ppto.
        </span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='relative flex h-3 w-full min-w-[120px] overflow-hidden rounded-full border bg-slate-200 dark:bg-slate-700'>
        <div
          className='flex h-full'
          style={{ width: `${100 - progressBarData.excessPercent}%` }}
        >
          {progressBarData.paidPercent > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className='h-full bg-green-500'
                  style={{ width: `${progressBarData.paidPercent}%` }}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                Cobrado: {formatCurrency(summary.paid)} (
                {progressBarData.paidPercent.toFixed(1)}%)
              </TooltipContent>
            </Tooltip>
          )}
          {progressBarData.outstandingPercent > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className='h-full bg-blue-500'
                  style={{ width: `${progressBarData.outstandingPercent}%` }}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                Pdte. Cobro: {formatCurrency(summary.outstanding)} (
                {progressBarData.outstandingPercent.toFixed(1)}%)
              </TooltipContent>
            </Tooltip>
          )}
          {progressBarData.pendingInvoicePercent > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className='h-full bg-amber-400'
                  style={{ width: `${progressBarData.pendingInvoicePercent}%` }}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                Pdte. Factura: {formatCurrency(summary.pendingInvoice)} (
                {progressBarData.pendingInvoicePercent.toFixed(1)}%)
              </TooltipContent>
            </Tooltip>
          )}
          {summary.unassigned > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className='h-full bg-purple-400'
                  style={{ width: `${progressBarData.unassignedPercent}%` }}
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                Sin Asignar: {formatCurrency(summary.unassigned)} (
                {progressBarData.unassignedPercent.toFixed(1)}%)
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {summary.unassigned < 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className='absolute right-0 h-full bg-red-500'
                style={{ width: `${Math.min(progressBarData.excessPercent, 100)}%` }}
              ></div>
            </TooltipTrigger>
            <TooltipContent>
              Exceso: {formatCurrency(Math.abs(summary.unassigned))} (
              {progressBarData.excessPercent.toFixed(1)}%)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
