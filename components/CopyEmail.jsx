'use client';

import { useState } from 'react';

export default function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" className="copymail" onClick={copy} aria-live="polite">
      <span>{email}</span>
      <span className="copymail__state" data-copied={copied}>
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
