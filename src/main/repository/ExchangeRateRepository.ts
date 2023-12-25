import { DataSource, Repository } from 'typeorm';
import { ExchangeRateEntity } from '../entity/Entity';

export default class ExchangeRateRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<ExchangeRateEntity> {
    return this.dataSource.getRepository(ExchangeRateEntity);
  }
}
