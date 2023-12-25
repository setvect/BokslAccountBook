import { DataSource, Repository } from 'typeorm';
import { FavoriteEntity } from '../entity/Entity';

export default class FavoriteRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<FavoriteEntity> {
    return this.dataSource.getRepository(FavoriteEntity);
  }
}
