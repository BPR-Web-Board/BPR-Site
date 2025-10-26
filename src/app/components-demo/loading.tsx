export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>
        Loading components demo with real API data...
      </p>
    </div>
  );
}
