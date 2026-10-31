import React, { useEffect, useRef } from 'react';

export function Modal({ children, onClose, busy = false, labelledBy, describedBy, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  function onKeyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); if (!busy) onClose(); }
    if (event.key !== 'Tab') return;
    const items = [...ref.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = items[0]; const last = items[items.length - 1];
    if (!first) { event.preventDefault(); ref.current.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus(); }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (!busy && event.target === event.currentTarget) onClose(); }}><section ref={ref} tabIndex={-1} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-busy={busy} onKeyDown={onKeyDown}>{children}</section></div>;
}
