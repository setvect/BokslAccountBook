import fs from 'fs';
import createTestDatabase from './support/testDatabase';
import AppDataSource, { DB_PATH } from '../main/config/AppDataSource';

it('service imports use an unopened memory database during tests', () => {
  expect(DB_PATH).toBe(':memory:');
  expect(AppDataSource.isInitialized).toBe(false);
});

it('creates and cleans up a database outside the workspace', async () => {
  const database = await createTestDatabase();
  const filename = database.dataSource.options.database as string;
  try {
    expect(fs.existsSync(filename)).toBe(true);
    expect(await database.dataSource.query('PRAGMA integrity_check')).toEqual([{ integrity_check: 'ok' }]);
  } finally {
    await database.dispose();
  }
  expect(fs.existsSync(filename)).toBe(false);
});
