import { Repository } from 'typeorm';
import { CategoryEntity } from '../entity/Entity';

export default class CategoryRepository extends Repository<CategoryEntity> {
  async getCount(): Promise<number> {
    return this.count();
  }
}
