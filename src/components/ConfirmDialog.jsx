import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ prompt, onRespond }) {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const dialogRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!prompt) return;
    prevFocusRef.current = document.activeElement;
    // Default focus: primary action.
    setTimeout(() => confirmRef.current?.focus(), 0);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onRespond(false);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (document.activeElement === cancelRef.current) onRespond(false);
        else onRespond(true);
        return;
      }

      if (e.key === 'Tab') {
        // Simple focus trap between Cancel and Confirm.
        if (document.activeElement === confirmRef.current && e.shiftKey) {
          e.preventDefault();
          cancelRef.current?.focus();
        } else if (document.activeElement === cancelRef.current && !e.shiftKey) {
          e.preventDefault();
          confirmRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      prevFocusRef.current?.focus?.();
    };
  }, [prompt, onRespond]);

  if (!prompt) return null;

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onMouseDown={(e) => {
        // Click outside = cancel.
        if (e.target === e.currentTarget) onRespond(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        ref={dialogRef}
        style={{
          width: 'min(520px, calc(100vw - 32px))',
          borderRadius: 14,
          border: '1px solid var(--glass-border)',
          background: 'var(--bg-surface)',
          padding: 18,
          backdropFilter: 'blur(18px)',
        }}
      >
        <p id="confirm-title" style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 10px' }}>
          Please confirm
        </p>
        <p id="confirm-desc" style={{ color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
          {prompt.message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '8px 14px' }}
            onClick={() => onRespond(false)}
            ref={cancelRef}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-orange"
            style={{ padding: '8px 14px' }}
            onClick={() => onRespond(true)}
            ref={confirmRef}
          >
            Discard / Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

