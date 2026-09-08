// utils/normalizeText.js
export function normalizeText(text) {
  if (!text) return '';
  return text
    .normalize('NFD')                       // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')        // Remove accents
    .replace(/&/g, 'and')                   // Replace ampersand with 'and' (optional)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')           // Remove all non-alphanumeric except space and hyphen
    .replace(/\s+/g, '-')                   // Replace spaces with hyphens
    .replace(/-+/g, '-')                    // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); 
}
