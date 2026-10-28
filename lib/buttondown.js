// Thin wrapper around the Buttondown API (https://docs.buttondown.com).
// The key lives in the BUTTONDOWN_API_KEY environment variable on Vercel and
// is never sent to the browser. If it is missing, every call here is a no-op.

const API = 'https://api.buttondown.com/v1';

const apiKey = () => process.env.BUTTONDOWN_API_KEY || '';

export const emailEnabled = () => Boolean(apiKey());

async function call(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey()}`,
      'Content-Type': 'application/json',
      // Buttondown asks for this once per key before it will send live email.
      'X-Buttondown-Live-Dangerously': 'true',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, data };
}

// Adds one address to the Buttondown list. A 4xx usually means the address is
// already there, which is fine, so callers can ignore failures.
export async function addSubscriber(email) {
  if (!emailEnabled()) return { ok: false, status: 0, data: null };
  return call('/subscribers', { email_address: email });
}

// Creates an email and sends it to the whole list straight away.
export async function sendEmail({ subject, body }) {
  if (!emailEnabled()) return { ok: false, status: 0, data: null };
  return call('/emails', { subject, body, status: 'about_to_send' });
}
