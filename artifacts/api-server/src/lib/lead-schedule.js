export function validateLeadSchedule(lead, { allowPast = false, now = new Date() } = {}) {
  const date = String(lead.preferredDate || '').trim();
  const time = String(lead.preferredTime || '').trim();
  const requestedZone = String(lead.timeZone || '').trim();
  if (!date && !time && !requestedZone) return { fields: { preferredDate: '', preferredTime: '', timeZone: '' } };
  if (!date || !time) return { error: 'Please select both a preferred counselling date and time.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Select a valid counselling date.' };
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return { error: 'Select a valid counselling date.' };
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return { error: 'Select a valid counselling time.' };
  const timeZone = requestedZone || 'Asia/Kolkata';
  let parts;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now).map(p => [p.type, p.value]));
  } catch {
    return { error: 'Select a valid counselling time zone.' };
  }
  const current = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  if (!allowPast && `${date}T${time}` <= current) return { error: 'Please choose a counselling date and time in the future.' };
  return { fields: { preferredDate: date, preferredTime: time, timeZone } };
}
