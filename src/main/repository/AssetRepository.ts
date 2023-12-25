import { DataSource, Repository } from 'typeorm';
import { AssetGroupEntity } from '../entity/Entity';

export default class AssetRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<AssetGroupEntity> {
    return this.dataSource.getRepository(AssetGroupEntity);
  }
}
