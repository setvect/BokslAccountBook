import { DataSource, Repository } from 'typeorm';
import { StockEvaluateEntity } from '../entity/Entity';

export default class StockEvaluateRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<StockEvaluateEntity> {
    return this.dataSource.getRepository(StockEvaluateEntity);
  }
}
