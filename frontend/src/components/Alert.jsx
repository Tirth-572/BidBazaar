export default function Alert({ message, type = 'info' }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div style={{
      background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}`,
      color: isError ? 'var(--red)' : 'var(--accent-light)',
      borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14,
    }} role="alert">
      {message}
    </div>
  );
}
