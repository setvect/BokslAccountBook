import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';

export default class CategoryService {
  private static categoryRepository = new CategoryRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findCategoryAll() {
    return this.categoryRepository.repository.find({
      where: {
        deleteF: false,
      },
    });
  }
}
