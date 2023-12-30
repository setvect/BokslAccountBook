import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../entity/Entity';

export default class TransactionRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<TransactionEntity> {
    return this.dataSource.getRepository(TransactionEntity);
  }
}
