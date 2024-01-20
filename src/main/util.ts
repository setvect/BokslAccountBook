/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function escapeWildcards(value: string): string {
  return value.replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function toUTCDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * 수익률 계산 (현재가 - 매입가) / 매입가 * 100
 */
export function calcYield(totalAmount: number, evaluateAmount: number) {
  if (totalAmount === 0) {
    return 0;
  }

  return ((evaluateAmount - totalAmount) / totalAmount) * 100;
}
