import { DataSource, Repository } from 'typeorm';
import { MemoEntity } from '../entity/Entity';

export default class MemoRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<MemoEntity> {
    return this.dataSource.getRepository(MemoEntity);
  }
}
