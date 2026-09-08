export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-AU', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
}