'use client';

import { useState } from 'react';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ tone: '', text: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState({ tone: 'bad', text: 'Enter a full email address.' });
      return;
    }
    setBusy(true);
    setState({ tone: '', text: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Subscription failed. Try again in a minute.');
      setState({ tone: 'good', text: 'Subscribed. You will get an email when the next piece is published.' });
      setEmail('');
    } catch (err) {
      setState({ tone: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="subscribe" id="subscribe" aria-labelledby="subscribe-title">
      <div>
        <h2 id="subscribe-title">Get new writing by email</h2>
        <p>One email when something new is published. No other mail, and you can leave at any time.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="sub-email" className="skip">
            Email address
          </label>
          <input
            id="sub-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Subscribing' : 'Subscribe'}
          </button>
        </div>
        <p className="form-note" data-tone={state.tone} role="status">
          {state.text}
        </p>
      </form>
    </section>
  );
}
