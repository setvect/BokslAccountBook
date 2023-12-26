import { DataSource, Repository } from 'typeorm';
import { CodeItemEntity } from '../entity/Entity';
import { CodeKind } from '../../common/CommonType';

export default class CodeItemRepository {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  get repository(): Repository<CodeItemEntity> {
    return this.dataSource.getRepository(CodeItemEntity);
  }

  async getNextOrderNo(codeMainId: CodeKind): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('codeItem')
      .select('MAX(codeItem.orderNo)', 'maxOrderNo')
      .where('codeItem.codeMainId = :codeMainId', { codeMainId })
      .getRawOne();

    return result.maxOrderNo ? result.maxOrderNo + 1 : 1;
  }
}
