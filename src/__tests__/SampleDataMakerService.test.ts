import moment from 'moment/moment';
import path from 'path';
import { initConnection } from '../main/config/AppDataSource';
import SampleDataMakerService from '../main/service/SampleDataMakerService';

jest.mock('electron', () => ({
  app: {
    getAppPath: jest.fn(() => path.dirname(path.dirname(__dirname))),
    getName: jest.fn(() => 'App'),
    getVersion: jest.fn(() => '1.0.0'),
  },
}));

describe('DB 관련 테스트', () => {
  beforeAll(async () => {
    await initConnection();
  });

  // eslint-disable-next-line jest/expect-expect
  it('샘플데이터 생성', async () => {
    const currentDate = moment().format('YYYYMMDD_HHmmss');
    const backupFilePath = `db/BokslAccountBook_${currentDate}.db`;

    await SampleDataMakerService.makeSampleData(backupFilePath);
  }, 200_000);
});
