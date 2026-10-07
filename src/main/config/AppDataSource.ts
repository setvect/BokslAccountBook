import log from 'electron-log';
import { app } from 'electron';
import path from 'path';
import initializeDatabase from './initializeDatabase';
import createDataSource from './createDataSource';
import { isDevelopmentMode } from '../util';

// Tests must never open the development or user database, even through a service import.
function getDatabasePath() {
  if (process.env.NODE_ENV === 'test') return ':memory:';
  return isDevelopmentMode() ? 'db/BokslAccountBook.db' : path.join(app.getPath('userData'), 'BokslAccountBook.db');
}

export const DB_PATH = getDatabasePath();

if (process.env.NODE_ENV !== 'test') log.info('DB_PATH', DB_PATH);

const AppDataSource = createDataSource(DB_PATH, false, isDevelopmentMode() && process.env.NODE_ENV !== 'test');

export async function initConnection() {
  if (AppDataSource.isInitialized) {
    return;
  }
  const result = await initializeDatabase(AppDataSource);
  log.info('DB 연결 성공', { migrations: result.applied, backupPath: result.backupPath });
}
export async function closeConnection() {
  if (!AppDataSource.isInitialized) {
    return;
  }
  try {
    await AppDataSource.destroy();
    log.info('DB 연결 종료 성공');
  } catch (error) {
    log.error(`DB 연결 종료 실패: ${error}`);
  }
}

export default AppDataSource;
