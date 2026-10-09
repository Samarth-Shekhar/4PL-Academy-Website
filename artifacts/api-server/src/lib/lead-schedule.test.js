import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLeadSchedule } from './lead-schedule.js';

const now = new Date('2026-10-09T10:00:00Z'); // 15:30 IST.
const booking = { preferredDate: '2026-10-10', preferredTime: '09:30', timeZone: 'Asia/Kolkata' };

test('keeps unscheduled enquiries backward-compatible', () => {
  assert.deepEqual(validateLeadSchedule({}, { now }).fields, { preferredDate: '', preferredTime: '', timeZone: '' });
});
test('retains the precise preferred date, time and zone', () => {
  assert.deepEqual(validateLeadSchedule(booking, { now }).fields, booking);
});
test('rejects incomplete selections and impossible calendar dates', () => {
  for (const input of [
    { preferredDate: '2026-10-10' }, { preferredTime: '10:00' },
    { ...booking, preferredDate: '2026-02-30' },
    { ...booking, preferredTime: '25:00' },
    { ...booking, preferredDate: '2026-2-5' },
    { ...booking, timeZone: 'Invalid/Location' },
  ]) assert.ok(validateLeadSchedule(input, { now }).error);
});
test('compares the appointment against the chosen zone, including same-day times', () => {
  assert.ok(validateLeadSchedule({ ...booking, preferredDate: '2026-10-09', preferredTime: '15:30' }, { now }).error);
  assert.ok(validateLeadSchedule({ ...booking, preferredDate: '2026-10-09', preferredTime: '15:31' }, { now }).fields);
  assert.ok(validateLeadSchedule({ ...booking, preferredDate: '2026-10-08' }, { now }).error);
});
test('staff can edit historical appointment details without losing them', () => {
  assert.deepEqual(validateLeadSchedule({ ...booking, preferredDate: '2026-10-08' }, { now, allowPast: true }).fields.preferredDate, '2026-10-08');
});
test('supports real leap dates and defaults missing zones to IST', () => {
  const result = validateLeadSchedule({ preferredDate: '2028-02-29', preferredTime: '12:00' }, { now });
  assert.equal(result.fields.timeZone, 'Asia/Kolkata');
});
