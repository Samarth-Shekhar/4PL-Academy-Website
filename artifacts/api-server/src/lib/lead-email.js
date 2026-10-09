import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const RECIPIENT = 'contact@4placademy.com';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

// The local .env is ignored by Git. Replit's hosted environment should use
// Replit Secrets, which are already injected into process.env.
const localEnvCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];
const localEnvPath = localEnvCandidates.find((path) => existsSync(path));
if (localEnvPath && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(localEnvPath);
}

const fields = [
  ['Name', 'name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Phone country', 'phoneCountry'],
  ['Enquiry type', 'category'],
  ['Interested in', 'interestedIn'],
  ['University', 'university'],
  ['Program', 'program'],
  ['Course', 'course'],
  ['Qualification', 'qualification'],
  ['City', 'city'],
  ['Preferred counselling date', 'preferredDate'],
  ['Preferred counselling time', 'preferredTime'],
  ['Counselling time zone', 'timeZone'],
  ['Message and additional details', 'message'],
  ['Source page', 'source'],
  ['Campaign tracking', 'utm'],
];

const credentialKeys = {
  tenantId: ['MICROSOFT_TENANT_ID', 'AZURE_TENANT_ID', 'MS_TENANT_ID', 'tenantID'],
  clientId: ['MICROSOFT_CLIENT_ID', 'AZURE_CLIENT_ID', 'MS_CLIENT_ID', 'clientId'],
  clientSecret: ['MICROSOFT_CLIENT_SECRET', 'AZURE_CLIENT_SECRET', 'MS_CLIENT_SECRET', 'clientSecret'],
  mailbox: ['MICROSOFT_GRAPH_MAILBOX', 'email_ID'],
};

let tokenCache = null;

function firstEnvironmentValue(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function getGraphConfig() {
  return {
    tenantId: firstEnvironmentValue(credentialKeys.tenantId),
    clientId: firstEnvironmentValue(credentialKeys.clientId),
    clientSecret: firstEnvironmentValue(credentialKeys.clientSecret),
    mailbox: firstEnvironmentValue(credentialKeys.mailbox) || RECIPIENT,
  };
}

function display(value) {
  if (value === undefined || value === null || value === '') return 'Not provided';
  return String(value);
}

async function getAccessToken(config) {
  const cacheKey = `${config.tenantId}:${config.clientId}`;
  if (tokenCache?.cacheKey === cacheKey && Date.now() < tokenCache.expiresAt) {
    return { token: tokenCache.accessToken };
  }

  let response;
  try {
    response = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: GRAPH_SCOPE,
          grant_type: 'client_credentials',
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    return { reason: 'authentication_network_error' };
  }

  if (!response.ok) return { reason: `authentication_${response.status}` };

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { reason: 'authentication_invalid_response' };
  }
  if (typeof payload.access_token !== 'string' || !payload.access_token) {
    return { reason: 'authentication_invalid_response' };
  }

  const expiresIn = Number(payload.expires_in) || 3600;
  tokenCache = {
    cacheKey,
    accessToken: payload.access_token,
    expiresAt: Date.now() + Math.max(0, expiresIn - 60) * 1000,
  };
  return { token: payload.access_token };
}

export async function sendLeadNotification(lead, submissionId = randomUUID()) {
  const config = getGraphConfig();
  if (!config.tenantId || !config.clientId || !config.clientSecret) {
    return { sent: false, reason: 'not_configured' };
  }

  const safeName = String(lead.name).replace(/[\r\n\t]+/g, ' ').slice(0, 140);
  const subject = `New ${lead.category || 'counselling'} enquiry: ${safeName}`.slice(0, 200);
  const text = [
    'A new 4PL Academy website form was submitted.',
    `Lead reference: ${submissionId}`,
    '',
    ...fields.map(([label, key]) => `${label}: ${display(lead[key])}`),
    `Consent to be contacted: ${lead.consent ? 'Yes' : 'No'}`,
  ].join('\n');

  const auth = await getAccessToken(config);
  if (!auth.token) return { sent: false, reason: auth.reason };

  try {
    const response = await fetch(
      `${GRAPH_BASE}/users/${encodeURIComponent(config.mailbox)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'Text', content: text },
            toRecipients: [{ emailAddress: { address: RECIPIENT } }],
            replyTo: [{ emailAddress: { address: lead.email } }],
          },
          saveToSentItems: true,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (response.ok) return { sent: true };
    return { sent: false, reason: `graph_${response.status}` };
  } catch {
    // Do not retry a timed-out send: Graph may have accepted it already, and
    // retrying could deliver duplicate lead notifications.
    return { sent: false, reason: 'network_error' };
  }
}
