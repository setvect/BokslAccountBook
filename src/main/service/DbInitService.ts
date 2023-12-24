import log from 'electron-log';
import CategoryRepository from '../repository/CategoryRepository';
import AppDataSource from '../config/AppDataSource';
import { CategoryEntity } from '../entity/Entity';

/**
 * 최초 프로그램 실행 여부를 확인해 기본 데이터를 생성한다.
 */
export default async function initDataValue() {
  log.info('initDb()');
  const categoryRepository = AppDataSource.getRepository(CategoryEntity) as CategoryRepository;
  return categoryRepository.getCount();
}

initDataValue().catch(log.error);
