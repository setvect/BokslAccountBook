import React from 'react';

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
export function downloadForString(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadForTable(tableRef: React.RefObject<HTMLTableElement>, filename: string): void {
  // @ts-ignore
  const html = tableRef.current.outerHTML.replaceAll('<table', "<table border='1'");
  downloadForString(html, filename);
}
