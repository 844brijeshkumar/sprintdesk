import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps<T extends string | number = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select<T extends string | number = string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  error,
  disabled = false,
  className,
  id,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : 'custom-select');

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, isOpen);

  const selectedOption = options.find((opt) => opt.value === value);

  const selectOptionByIndex = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) {
        onChange(option.value);
        setIsOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
      }
    },
    [onChange, options]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      const item = items[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0) {
            selectOptionByIndex(highlightedIndex);
          } else {
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          const currentIndex = options.findIndex((o) => o.value === value);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('w-full space-y-1.5 text-left relative', className)}>
      {label && (
        <label id={`${selectId}-label`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        id={selectId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${selectId}-label ${selectId}` : selectId}
        aria-controls={`${selectId}-listbox`}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              const idx = options.findIndex((o) => o.value === value);
              setHighlightedIndex(idx >= 0 ? idx : 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-colors text-left',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'dark:bg-slate-900 dark:text-slate-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-850',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
        )}
      >
        <span className={cn('flex items-center gap-2 truncate', !selectedOption && 'text-slate-400 dark:text-slate-500')}>
          {selectedOption?.icon}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          id={`${selectId}-listbox`}
          role="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg focus:outline-none dark:border-slate-800 dark:bg-slate-900 animate-fade-in"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = highlightedIndex === index;

            return (
              <li
                key={String(option.value)}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOptionByIndex(index)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between px-3 py-2 text-sm select-none transition-colors',
                  isHighlighted
                    ? 'bg-brand-50 text-brand-900 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'text-slate-700 dark:text-slate-300',
                  isSelected && 'font-medium'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <div>
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">{option.description}</div>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
}
