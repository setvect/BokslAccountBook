import { DataSource, Repository } from 'typeorm';
import { ExchangeEntity } from '../entity/Entity';

export default class ExchangeRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<ExchangeEntity> {
    return this.dataSource.getRepository(ExchangeEntity);
  }
}
