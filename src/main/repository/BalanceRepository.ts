import { DataSource, Repository } from 'typeorm';
import { BalanceEntity } from '../entity/Entity';

export default class BalanceRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<BalanceEntity> {
    return this.dataSource.getRepository(BalanceEntity);
  }
}
