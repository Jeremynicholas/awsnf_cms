// utils/formatDateVerbose.js
export function formatDateVerbose(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr); // dateStr should be YYYY-MM-DD
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',   // Mon
    day: 'numeric',     // 21
    month: 'long',      // March
    year: 'numeric'     // 2025
  });
}
