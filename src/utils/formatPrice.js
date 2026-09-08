// utils/formatPrice.js
export function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0
    }).format(value);
  }
