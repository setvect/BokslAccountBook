import { DataSource, Repository } from 'typeorm';
import { AccountEntity } from '../entity/Entity';

export default class AccountRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<AccountEntity> {
    return this.dataSource.getRepository(AccountEntity);
  }
}
