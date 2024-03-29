import AppDataSource from '../config/AppDataSource';
import CategoryRepository from '../repository/CategoryRepository';
import { ReqCategoryModel } from '../../common/ReqModel';
import { CategoryEntity } from '../entity/Entity';
import { ResCategoryModel } from '../../common/ResModel';

export default class CategoryService {
  private static categoryRepository = new CategoryRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findAll() {
    const categoryList = await this.categoryRepository.repository.find({
      order: {
        orderNo: 'ASC',
      },
    });

    const response: ResCategoryModel[] = categoryList.map((category) => {
      const { categorySeq, name, kind, parentSeq, orderNo, deleteF } = category;
      return { categorySeq, name, kind, parentSeq, orderNo, deleteF };
    });
    return response;
  }

  static async updateOrder(updateInfo: { categorySeq: number; orderNo: number }[]) {
    const updatePromises = updateInfo.map((item) =>
      this.categoryRepository.repository.update({ categorySeq: item.categorySeq }, { orderNo: item.orderNo }),
    );

    await Promise.all(updatePromises);
  }

  static async save(categoryForm: ReqCategoryModel) {
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

  static async update(categoryForm: ReqCategoryModel) {
    await this.categoryRepository.repository.update({ categorySeq: categoryForm.categorySeq }, { name: categoryForm.name });
  }

  static async delete(categorySeq: number) {
    await this.categoryRepository.repository.update({ categorySeq }, { deleteF: true });
  }
}
