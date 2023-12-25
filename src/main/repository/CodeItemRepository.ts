import { DataSource, Repository } from 'typeorm';
import { CodeItemEntity } from '../entity/Entity';

export default class CodeItemRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CodeItemEntity> {
    return this.dataSource.getRepository(CodeItemEntity);
  }
}
