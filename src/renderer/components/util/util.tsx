export function convertToComma(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toLocaleString();
}

export function convertToCommaDecimal(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function convertToPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }
  return `${(value * 100).toFixed(2)}%`;
}
