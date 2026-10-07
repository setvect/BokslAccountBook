import fs from 'fs';
import os from 'os';
import path from 'path';
import createDataSource from '../../main/config/createDataSource';

export default async function createTestDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'boksl-test-'));
  const dataSource = createDataSource(path.join(directory, 'test.db'), true);
  try {
    await dataSource.initialize();
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  return {
    dataSource,
    async dispose() {
      try {
        if (dataSource.isInitialized) await dataSource.destroy();
      } finally {
        fs.rmSync(directory, { recursive: true, force: true });
      }
    },
  };
}
