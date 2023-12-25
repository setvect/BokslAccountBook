import { DataSource, Repository } from 'typeorm';
import { StockBuyEntity } from '../entity/Entity';

export default class StockBuyRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<StockBuyEntity> {
    return this.dataSource.getRepository(StockBuyEntity);
  }
}
