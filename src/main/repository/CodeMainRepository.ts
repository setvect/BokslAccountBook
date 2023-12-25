import { DataSource, Repository } from 'typeorm';
import { CodeMainEntity } from '../entity/Entity';

export default class CodeMainRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CodeMainEntity> {
    return this.dataSource.getRepository(CodeMainEntity);
  }
}
