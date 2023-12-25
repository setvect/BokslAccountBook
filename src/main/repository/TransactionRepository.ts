import { DataSource, Repository } from 'typeorm';
import { StockEntity } from '../entity/Entity';

export default class StockRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<StockEntity> {
    return this.dataSource.getRepository(StockEntity);
  }
}
