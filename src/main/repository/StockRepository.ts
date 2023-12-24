import { Repository } from 'typeorm';
import { StockEntity } from '../entity/Entity';

export default class StockRepository extends Repository<StockEntity> {}
