import { isSupportedCountry, parsePhoneNumberFromString } from 'libphonenumber-js/max';

export function validateLeadPhone(value, country) {
  if (!country || !isSupportedCountry(country)) return { error: 'Select a valid phone country.' };
  if (typeof value !== 'string' || !/^[+\d\s()-]{7,25}$/.test(value)) return { error: 'Enter a valid phone number for the selected country.' };
  const parsed = parsePhoneNumberFromString(value, { defaultCountry: country, extract: false });
  if (!parsed?.isValid() || parsed.country !== country) return { error: `Enter a valid phone number for ${country}. The number must match the selected country code.` };
  return { phone: parsed.number, phoneCountry: country };
}
