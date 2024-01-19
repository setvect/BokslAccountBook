import { DataSource, Repository } from 'typeorm';
import { AssetGroupEntity } from '../entity/Entity';

export default class AssetGroupRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<AssetGroupEntity> {
    return this.dataSource.getRepository(AssetGroupEntity);
  }
}
