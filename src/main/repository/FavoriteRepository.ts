import { DataSource, Repository } from 'typeorm';
import { FavoriteEntity } from '../entity/Entity';
import { TransactionKind } from '../../common/CommonType';

export default class FavoriteRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<FavoriteEntity> {
    return this.dataSource.getRepository(FavoriteEntity);
  }

  async getNextOrderNo(kind: TransactionKind): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('favorite')
      .select('MAX(favorite.orderNo)', 'maxOrderNo')
      .where('favorite.kind = :kind', { kind })
      .getRawOne();

    return result.maxOrderNo ? result.maxOrderNo + 1 : 1;
  }
}
