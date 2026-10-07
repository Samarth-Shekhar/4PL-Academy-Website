import { randomUUID } from 'node:crypto';

const RECIPIENT = 'contact@4placademy.com';
const DEFAULT_SENDER = '4PL Academy <contact@4placademy.com>';

const fields = [
  ['Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Enquiry type', 'category'],
  ['Interested in', 'interestedIn'],
  ['University', 'university'],
  ['Program', 'program'],
  ['Course', 'course'],
  ['Qualification', 'qualification'],
  ['City', 'city'],
  ['Message and additional details', 'message'],
  ['Source page', 'source'],
  ['Campaign tracking', 'utm'],
];

function display(value) {
  if (value === undefined || value === null || value === '') return 'Not provided';
  return String(value);
}

export async function sendLeadNotification(lead, submissionId = randomUUID()) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'not_configured' };

  const safeName = String(lead.name).replace(/[\r\n\t]+/g, ' ').slice(0, 140);
  const subject = `New ${lead.category || 'counselling'} enquiry: ${safeName}`.slice(0, 200);
  const text = [
    'A new 4PL Academy website form was submitted.',
    '',
    ...fields.map(([label, key]) => `${label}: ${display(lead[key])}`),
    `Consent to be contacted: ${lead.consent ? 'Yes' : 'No'}`,
  ].join('\n');

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `academy-lead-${submissionId}`,
        },
        body: JSON.stringify({
          from: process.env.LEAD_NOTIFICATION_FROM || DEFAULT_SENDER,
          to: [RECIPIENT],
          reply_to: lead.email,
          subject,
          text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return { sent: true };
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        continue;
      }
      return { sent: false, reason: `provider_${response.status}` };
    } catch {
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        continue;
      }
      return { sent: false, reason: 'network_error' };
    }
  }
  return { sent: false, reason: 'network_error' };
}
