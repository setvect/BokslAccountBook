import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from '../entity/Entity';

export default class CategoryRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CategoryEntity> {
    return this.dataSource.getRepository(CategoryEntity);
  }

  async getCount(): Promise<number> {
    return this.repository.count();
  }

  async getCountByCondition(condition: Partial<CategoryEntity>): Promise<number> {
    return this.repository.count({ where: condition });
  }
}
