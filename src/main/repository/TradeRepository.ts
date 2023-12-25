import { DataSource, Repository } from 'typeorm';
import { TradeEntity } from '../entity/Entity';

export default class TradeRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<TradeEntity> {
    return this.dataSource.getRepository(TradeEntity);
  }
}
