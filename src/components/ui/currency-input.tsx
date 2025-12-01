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

// Regex to validate currency input: allows digits, comma or dot as decimal separator, up to 2 decimal places
const currencyRegex = /^-?\d*([.,]\d{0,2})?$/

const parseLocaleNumber = (value: string): number => {
  // Replace comma with dot for parsing
  const normalized = value.replace(',', '.')
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
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
      const parsed = parseLocaleNumber(inputValue)
      onChange(parsed)
      setInputValue(parsed.toString())
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      
      // Allow empty string or values matching the currency regex
      if (newValue === '' || currencyRegex.test(newValue)) {
        setInputValue(newValue)
        
        // Update parent on valid numeric input
        const parsed = parseLocaleNumber(newValue)
        if (newValue !== '' && newValue !== '-') {
          onChange(parsed)
        }
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

    const handleDisplayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Enter or Space activates the input
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleDisplayClick()
      }
    }

    const handleDisplayFocus = () => {
      // When the display div receives focus (via tab), immediately switch to input mode
      handleDisplayClick()
    }

    if (!isFocused) {
      // Show formatted display - make it focusable for tab navigation
      return (
        <div
          className={cn(
            'flex h-8 items-center justify-end px-3 cursor-text font-mono text-sm rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
            className
          )}
          onClick={handleDisplayClick}
          onKeyDown={handleDisplayKeyDown}
          onFocus={handleDisplayFocus}
          tabIndex={0}
          role="button"
          aria-label={`${formatCurrency(value, locale, currency)}, click to edit`}
        >
          {formatCurrency(value, locale, currency)}
        </div>
      )
    }

    // Show input when focused
    return (
      <input
        type='text'
        inputMode='decimal'
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
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
