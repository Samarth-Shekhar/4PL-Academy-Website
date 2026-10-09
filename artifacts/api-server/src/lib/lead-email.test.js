import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { sendLeadNotification } from './lead-email.js';

const envKeys = [
  'MICROSOFT_TENANT_ID', 'AZURE_TENANT_ID', 'MS_TENANT_ID', 'tenantID',
  'MICROSOFT_CLIENT_ID', 'AZURE_CLIENT_ID', 'MS_CLIENT_ID', 'clientId',
  'MICROSOFT_CLIENT_SECRET', 'AZURE_CLIENT_SECRET', 'MS_CLIENT_SECRET', 'clientSecret',
  'MICROSOFT_GRAPH_MAILBOX', 'email_ID',
];
const originalEnv = new Map(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;
let mockedFetch;

beforeEach(() => {
  for (const key of envKeys) delete process.env[key];
  globalThis.fetch = (...args) => mockedFetch(...args);
});

afterEach(() => {
  for (const [key, value] of originalEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
});

test('reports missing Microsoft credentials without making a network request', async () => {
  let requestCount = 0;
  mockedFetch = async () => {
    requestCount += 1;
    throw new Error('Unexpected network request');
  };

  const result = await sendLeadNotification({ name: 'Test Lead' }, 'lead-1');

  assert.deepEqual(result, { sent: false, reason: 'not_configured' });
  assert.equal(requestCount, 0);
});

test('sends the complete lead to the contact inbox through Microsoft Graph', async () => {
  process.env.tenantID = 'tenant-for-test';
  process.env.clientId = 'client-for-test';
  process.env.clientSecret = 'secret-for-test';
  process.env.email_ID = 'contact@4placademy.com';

  const requests = [];
  mockedFetch = async (url, options) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('/oauth2/v2.0/token')) {
      return new Response(JSON.stringify({ access_token: 'mock-access-token', expires_in: 3600 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 202 });
  };

  const lead = {
    name: 'Sample Learner',
    email: 'learner@example.com',
    phone: '+91 98765 43210',
    phoneCountry: 'IN',
    consent: true,
    category: 'counselling',
    university: 'Sample University',
    program: 'BBA',
    course: 'Global Logistics',
    interestedIn: 'Undergraduate',
    qualification: 'High school',
    city: 'Gurugram',
    preferredDate: '2026-10-12',
    preferredTime: '14:30',
    timeZone: 'Asia/Kolkata',
    source: '/contact-us',
    utm: 'campaign=spring',
    message: 'Please call me about course options.',
  };

  const result = await sendLeadNotification(lead, 'lead-graph-test-2');

  assert.deepEqual(result, { sent: true });
  assert.equal(requests.length, 2);
  const [tokenRequest, mailRequest] = requests;
  assert.match(tokenRequest.url, /tenant-for-test\/oauth2\/v2\.0\/token$/);
  assert.equal(tokenRequest.options.method, 'POST');
  assert.match(mailRequest.url, /\/users\/contact%404placademy\.com\/sendMail$/);
  assert.equal(mailRequest.options.headers.Authorization, 'Bearer mock-access-token');

  const message = JSON.parse(mailRequest.options.body).message;
  assert.equal(message.toRecipients[0].emailAddress.address, 'contact@4placademy.com');
  assert.equal(message.replyTo[0].emailAddress.address, lead.email);
  assert.equal(message.body.contentType, 'Text');
  assert.ok(message.body.content.includes('Phone country: IN'));
  for (const value of Object.values(lead).filter((value) => typeof value === 'string')) {
    assert.ok(message.body.content.includes(String(value)), `Missing submitted value: ${value}`);
  }
  assert.ok(message.body.content.includes('Lead reference: lead-graph-test-2'));
  assert.ok(message.body.content.includes('Consent to be contacted: Yes'));
});
