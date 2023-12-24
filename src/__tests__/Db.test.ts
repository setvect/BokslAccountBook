import AppDataSource, { initConnection } from '../main/config/AppDataSource';
import { createUser } from '../main/service/UserService';

describe('DB 관련 테스트', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await initConnection();
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('단수 DB 연결 테스트', async () => {
    const user = await createUser();
    console.log(user);
  });
});
