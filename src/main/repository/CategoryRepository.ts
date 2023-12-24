import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from '../entity/Entity';

export default class CategoryRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CategoryEntity> {
    return this.dataSource.getRepository(CategoryEntity);
  }
}
