/**
 * Formats a number into Indian Rupee standard format (e.g., ₹1,499.00 or ₹499)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Validates 6-digit Indian PIN Code (first digit 1-9, total 6 digits)
 */
export function isValidIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Validates 10-digit Indian Mobile number (starts with 6, 7, 8, or 9)
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-+]/g, '');
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(cleaned.slice(2));
  }
  return false;
}

/**
 * Generates an Order ID in standard format (e.g., ORD-2026-98241)
 */
export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${year}-${randomNum}`;
}

/**
 * Format date in a clean readable form
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}
