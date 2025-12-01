import * as React from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  currency?: string
  locale?: string
}

const formatCurrency = (value: number, locale: string, currency: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value)
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, currency = 'EUR', locale = 'es-ES', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value.toString())
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Sync input value when external value changes and not focused
    React.useEffect(() => {
      if (!isFocused) {
        setInputValue(value.toString())
      }
    }, [value, isFocused])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      setInputValue(value.toString())
      // Select all text on focus
      setTimeout(() => {
        e.target.select()
      }, 0)
    }

    const handleBlur = () => {
      setIsFocused(false)
      const parsed = parseFloat(inputValue)
      if (!isNaN(parsed)) {
        onChange(parsed)
      } else {
        setInputValue(value.toString())
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      
      // Update parent on valid input
      const parsed = parseFloat(newValue)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        inputRef.current?.blur()
      }
    }

    const handleDisplayClick = () => {
      setIsFocused(true)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }

    if (!isFocused) {
      // Show formatted display
      return (
        <div
          className={cn(
            'flex h-8 items-center justify-end px-3 cursor-text font-mono text-sm rounded-md hover:bg-muted/50 transition-colors',
            className
          )}
          onClick={handleDisplayClick}
        >
          {formatCurrency(value, locale, currency)}
        </div>
      )
    }

    // Show input when focused
    return (
      <input
        type='number'
        ref={(node) => {
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-right shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        min={0}
        step={0.01}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
