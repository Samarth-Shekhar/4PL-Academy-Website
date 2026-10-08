import { getCountries, getCountryCallingCode, isSupportedCountry, parsePhoneNumberFromString } from 'libphonenumber-js/max';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
export const PHONE_COUNTRIES = getCountries().map((country) => ({
  value: country, label: `${regions.of(country)} (+${getCountryCallingCode(country)})`,
})).sort((a, b) => a.label.localeCompare(b.label));

export function getPhoneError(value, country) {
  if (!country || !isSupportedCountry(country)) return 'Please select a phone country.';
  if (!value?.trim()) return 'Please enter your phone number.';
  const phone = parsePhoneNumberFromString(value, { defaultCountry: country, extract: false });
  if (!phone?.isValid() || phone.country !== country) {
    return `Enter a valid ${regions.of(country)} number without the +${getCountryCallingCode(country)} country code.`;
  }
  return '';
}
export function normalizePhone(value, country) {
  if (getPhoneError(value, country)) return '';
  return parsePhoneNumberFromString(value, { defaultCountry: country, extract: false }).number;
}
export function initialPhoneFields(value, country) {
  const parsed = parsePhoneNumberFromString(value || '', country || 'IN');
  const phoneCountry = country || parsed?.country || 'IN';
  return { phoneCountry, phone: parsed?.country === phoneCountry ? parsed.nationalNumber : (value || '').replace(/[^\d+]/g, '') };
}
