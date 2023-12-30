import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';
import { CategoryFrom } from '../../common/ReqModel';
import { CategoryEntity } from '../entity/Entity';

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

  static async updateCategoryOrder(updateInfo: { categorySeq: number; orderNo: number }[]) {
    const updatePromises = updateInfo.map((item) =>
      this.categoryRepository.repository.update({ categorySeq: item.categorySeq }, { orderNo: item.orderNo }),
    );

    await Promise.all(updatePromises);
  }

  static async saveCategory(categoryForm: CategoryFrom) {
    const orderNo = await this.categoryRepository.getNextOrderNo(categoryForm.kind, categoryForm.parentSeq);
    const entity: CategoryEntity = this.categoryRepository.repository.create({
      kind: categoryForm.kind,
      name: categoryForm.name,
      parentSeq: categoryForm.parentSeq,
      orderNo,
      deleteF: false,
    });
    await this.categoryRepository.repository.save(entity);
  }

  static async updateCategory(categoryForm: CategoryFrom) {
    await this.categoryRepository.repository.update({ categorySeq: categoryForm.categorySeq }, { name: categoryForm.name });
  }

  static async deleteCategory(categorySeq: number) {
    await this.categoryRepository.repository.update({ categorySeq }, { deleteF: true });
  }
}
