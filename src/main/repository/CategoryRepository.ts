import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from '../entity/Entity';
import { TransactionKind } from '../../common/CommonType';

export default class CategoryRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CategoryEntity> {
    return this.dataSource.getRepository(CategoryEntity);
  }

  async getNextOrderNo(kind: TransactionKind, parentSeq: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('category')
      .select('MAX(category.orderNo)', 'maxOrderNo')
      .where('category.kind = :kind', { kind })
      .andWhere('category.parentSeq = :parentSeq', { parentSeq })
      .getRawOne();

    return result.maxOrderNo ? result.maxOrderNo + 1 : 1;
  }
}
