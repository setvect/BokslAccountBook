import { DataSource } from 'typeorm';
import log from 'electron-log';
import User from '../entity/Entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db/BokslAccountBook.db',
  entities: [User],
  synchronize: true,
});

AppDataSource.initialize()
  // eslint-disable-next-line promise/always-return
  .then(() => {
    log.info('DB 연결 성공');
  })
  .catch((error) => {
    log.error(`DB 연결 실패${error}`);
  });

export default AppDataSource;
