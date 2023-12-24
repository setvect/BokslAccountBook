import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';

/**
 * 최초 프로그램 실행 여부를 확인해 기본 데이터를 생성한다.
 */
export default class DbInitService {
  private static categoryRepository = new CategoryRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async initDbData() {
    log.info('initDbData()');
    await this.initCategory();
  }

  private static async initCategory() {
    const filePath = path.join(__dirname, '../assets/init_data/BC_CATEGORY.json');
    const categoriesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let count = await this.categoryRepository.repository.count();
    if (count !== 0) {
      log.info(`${count} 데이터 있음 초기화 하지 않음`);
      return;
    }

    const categoryPromises = categoriesData.map((categoryData: any) =>
      this.categoryRepository.repository.save(this.categoryRepository.repository.create(categoryData)),
    );

    await Promise.all(categoryPromises);
    count = await this.categoryRepository.repository.count();
    log.info(`총 ${count}개의 카테고리가 생성되었습니다.`);
  }
}
