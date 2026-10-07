import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  AccountEntity,
  AssetGroupEntity,
  BalanceEntity,
  CategoryEntity,
  CodeItemEntity,
  CodeMainEntity,
  ExchangeEntity,
  ExchangeRateEntity,
  FavoriteEntity,
  MemoEntity,
  SnapshotEntity,
  StockBuyEntity,
  StockEntity,
  StockEvaluateEntity,
  TradeEntity,
  TransactionEntity,
  UserEntity,
} from '../entity/Entity';

/** Electron 없이도 생성할 수 있는 DB 설정. 호출자가 DB 경로와 스키마 정책을 지정한다. */
export default function createDataSource(database: string, synchronize = false, logging = false) {
  return new DataSource({
    type: 'sqlite',
    database,
    entities: [
      UserEntity,
      AccountEntity,
      BalanceEntity,
      CategoryEntity,
      FavoriteEntity,
      MemoEntity,
      TransactionEntity,
      StockEntity,
      StockBuyEntity,
      TradeEntity,
      ExchangeEntity,
      SnapshotEntity,
      ExchangeRateEntity,
      AssetGroupEntity,
      StockEvaluateEntity,
      CodeMainEntity,
      CodeItemEntity,
    ],
    synchronize,
    logging,
  });
}
