import { DataSource, Repository } from 'typeorm';
import { SnapshotEntity } from '../entity/Entity';

export default class SnapshotRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<SnapshotEntity> {
    return this.dataSource.getRepository(SnapshotEntity);
  }
}
