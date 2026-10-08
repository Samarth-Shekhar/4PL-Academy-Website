import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLeadPhone } from './lead-phone.js';
import { getPhoneError, normalizePhone, initialPhoneFields, PHONE_COUNTRIES } from '../../../academy/src/lib/phone.js';

const examples = [
  ['IN', '9876543210', '+919876543210'],
  ['GB', '07400123456', '+447400123456'],
  ['US', '2025550123', '+12025550123'],
  ['CA', '4165550123', '+14165550123'],
  ['AU', '0412345678', '+61412345678'],
  ['AE', '0501234567', '+971501234567'],
  ['SG', '81234567', '+6581234567'],
];
test('frontend and server agree on country-specific validation and E.164 storage', () => {
  for (const [country, national, international] of examples) {
    assert.equal(getPhoneError(national, country), '', country);
    assert.equal(normalizePhone(national, country), international, country);
    assert.deepEqual(validateLeadPhone(national, country), { phone: international, phoneCountry: country });
    assert.deepEqual(validateLeadPhone(international, country), { phone: international, phoneCountry: country });
  }
});
test('rejects unsupported countries, missing countries, wrong calling codes and invalid lengths', () => {
  for (const [country, value] of [['ZZ', '9876543210'], ['', '9876543210'], ['IN', '+447400123456'], ['IN', '123'], ['US', '202555012345678'], ['US', '+14165550123'], ['IN', '0000000000'], ['IN', 'abcd9876543210']]) {
    assert.ok(validateLeadPhone(value, country).error, `${country}: ${value}`);
    assert.ok(getPhoneError(value, country), `${country}: ${value}`);
    assert.equal(normalizePhone(value, country), '');
  }
});
test('editor can open international and legacy records without rewriting the stored record', () => {
  assert.deepEqual(initialPhoneFields('+447400123456', 'GB'), { phone: '7400123456', phoneCountry: 'GB' });
  assert.deepEqual(initialPhoneFields('9876543210', ''), { phone: '9876543210', phoneCountry: 'IN' });
  assert.deepEqual(initialPhoneFields('+12025550123', ''), { phone: '2025550123', phoneCountry: 'US' });
  assert.deepEqual(initialPhoneFields('1234567', ''), { phone: '1234567', phoneCountry: 'IN' });
  assert.ok(PHONE_COUNTRIES.length > 200);
  assert.ok(PHONE_COUNTRIES.find((item) => item.value === 'IN').label.includes('+91'));
});
