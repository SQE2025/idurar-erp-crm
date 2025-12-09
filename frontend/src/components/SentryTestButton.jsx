import * as Sentry from '@sentry/react';

// Small floating button to manually send a Sentry test error when enabled
export default function SentryTestButton() {
  const handleClick = () => {
    // Throwing lets the global handler capture it; captureException is a backup
    try {
      throw new Error('Sentry test error from UI');
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        padding: '10px 14px',
        background: '#b42318',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        zIndex: 9999,
      }}
    >
      Test Sentry
    </button>
  );
}