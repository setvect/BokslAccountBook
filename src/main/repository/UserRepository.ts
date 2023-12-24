import { DataSource, Repository } from 'typeorm';
import { CategoryEntity, UserEntity } from '../entity/Entity';

export default class UserRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<UserEntity> {
    return this.dataSource.getRepository(UserEntity);
  }

  async getCount(): Promise<number> {
    return this.repository.count();
  }
}
