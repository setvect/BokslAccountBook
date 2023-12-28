import log from 'electron-log';
import { initConnection } from '../main/config/AppDataSource';
import AccountService from '../main/service/AccountService';

describe('DB 관련 테스트', () => {
  beforeAll(async () => {
    await initConnection();
  });

  // eslint-disable-next-line jest/expect-expect
  it('단순 DB 연결 테스트', async () => {
    // await DbInitService.initDbData();
    const a = await AccountService.findAccountAll();
    log.info(a);
  });
});
