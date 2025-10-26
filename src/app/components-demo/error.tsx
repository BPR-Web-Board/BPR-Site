'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem'
    }}>
      <h2 style={{ color: '#d32f2f', fontSize: '2rem' }}>
        Something went wrong loading the components demo!
      </h2>
      <p style={{ color: '#666', maxWidth: '600px', textAlign: 'center' }}>
        {error.message || 'An error occurred while fetching data from the API.'}
      </p>
      <details style={{ marginTop: '1rem', maxWidth: '800px' }}>
        <summary style={{ cursor: 'pointer', color: '#666' }}>
          Error details
        </summary>
        <pre style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
          {error.stack}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Try again
      </button>
    </div>
  );
}
