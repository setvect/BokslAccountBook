import { initConnection } from '../main/config/AppDataSource';
import initDataValue from '../main/service/DbInitService';

describe('DB 관련 테스트', () => {
  beforeAll(async () => {
    await initConnection();
  });

  // eslint-disable-next-line jest/expect-expect
  it('단수 DB 연결 테스트', async () => {
    await initDataValue();
  });
});
