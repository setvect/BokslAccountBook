import path from 'path';
import SampleDataMakerService from '../../src/main/service/SampleDataMakerService';
import { closeConnection, initConnection } from '../../src/main/config/AppDataSource';

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join('db', `BokslAccountBook_${stamp}.db`);
  try {
    await initConnection();
    await SampleDataMakerService.makeSampleData(backupPath);
    console.log(`샘플 데이터 생성 완료. 이전 DB 백업: ${backupPath}`);
  } finally {
    await closeConnection();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
