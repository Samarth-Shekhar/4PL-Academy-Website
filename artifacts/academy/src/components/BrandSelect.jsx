import { forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

const NONE = '__none__';

/* Shared branded dropdown. options: strings or {value,label}. An option whose
   value is '' is the "empty" choice and is mapped to a sentinel internally. */
export const BrandSelect = forwardRef(function BrandSelect({ id, name, value = '', onChange, onBlur, options = [], placeholder = 'Select', disabled, invalid, className = '', 'aria-label': ariaLabel, ...rest }, ref) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const cur = opts.find((o) => o.value === value);
  return (
    <Select.Root value={value === '' ? NONE : value} onValueChange={(v) => onChange?.(v === NONE ? '' : v)} disabled={disabled} name={name}>
      <Select.Trigger ref={ref} id={id} onBlur={onBlur} aria-invalid={invalid || undefined} aria-label={ariaLabel} data-testid={rest['data-testid']} className={`brand-select-trigger ${className}`}>
        <span className="min-w-0 flex-1 truncate text-left">{cur ? cur.label : placeholder}</span>
        <Select.Icon><ChevronDown className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} className="brand-select-content">
          <Select.Viewport className="max-h-[min(20rem,var(--radix-select-content-available-height))] p-1.5">
            {opts.map((o) => (
              <Select.Item key={o.value || NONE} value={o.value === '' ? NONE : o.value} className="brand-select-item">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator className="ml-auto pl-2"><Check className="h-4 w-4" aria-hidden="true" /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
});
