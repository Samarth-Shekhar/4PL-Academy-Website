import { forwardRef } from 'react';
import { BrandSelect } from '@/components/BrandSelect';
import { getExampleNumber } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import { PHONE_COUNTRIES } from '@/lib/phone';

export const PhoneField = forwardRef(function PhoneField({ id, value = '', country = 'IN', onChange, onCountryChange, onBlur, error, disabled, required = true }, ref) {
  return <div className="min-w-0">
    <div className="grid min-w-0 gap-2">
      <BrandSelect id={`${id}-country`} value={country} onChange={(next) => { onCountryChange(next); onChange(''); }} options={PHONE_COUNTRIES} disabled={disabled} aria-label="Phone country and calling code" data-testid={`${id}-country`} />
      <input ref={ref} id={id} type="tel" inputMode="tel" className="input" autoComplete="tel-national" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))} onBlur={onBlur} placeholder={getExampleNumber(country, examples)?.formatNational() || 'National phone number'} maxLength={17} required={required} disabled={disabled} aria-invalid={!!error} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} data-testid={id} />
    </div>
    <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">Enter the national number. The selected country code is added automatically.</p>
    {error && <p id={`${id}-error`} className="field-err" role="alert">{error}</p>}
  </div>;
});
