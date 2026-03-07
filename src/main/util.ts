/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function isDevelopmentMode() {
  return process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' || process.env.NODE_ENV === 'test';
}

export function resolveProjectPath(...paths: string[]) {
  return path.join(process.cwd(), ...paths);
}

export function resolveAssetPath(...paths: string[]) {
  if (isDevelopmentMode()) {
    return resolveProjectPath('assets', ...paths);
  }

  return path.join(process.resourcesPath, 'assets', ...paths);
}

export function resolveHtmlPath(htmlFileName: string) {
  if (isDevelopmentMode()) {
    const port = process.env.PORT || 4343;
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
