import log from 'electron-log';
import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';

/**
 * 최초 프로그램 실행 여부를 확인해 기본 데이터를 생성한다.
 */
export default async function initDataValue() {
  log.info('initDb()');
  const categoryRepository = new CategoryRepository(AppDataSource);
  const count = await categoryRepository.getCount();
}
