// eslint-disable-next-line max-classes-per-file
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CodeKind, Currency, TradeKind, TransactionKind } from '../../common/CommonType';

@Entity('AA_USER')
export class UserEntity {
  @PrimaryColumn({ length: 20, name: 'USER_ID' })
  userId!: string;

  @Column({ length: 50, name: 'NAME' })
  name!: string;

  @Column({ length: 60, name: 'PASSWD' })
  passwd!: string;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('BA_ACCOUNT')
export class AccountEntity {
  @PrimaryGeneratedColumn({ name: 'ACCOUNT_SEQ' })
  accountSeq!: number;

  @Column({ length: 100, name: 'NAME' })
  name!: string;

  @Column({ length: 100, nullable: true, name: 'ACCOUNT_NUMBER' })
  accountNumber?: string;

  @Column({ name: 'ASSET_TYPE' })
  assetType!: number;

  @Column({ name: 'ACCOUNT_TYPE' })
  accountType!: number;

  @Column({ length: 100, nullable: true, name: 'INTEREST_RATE' })
  interestRate?: string;

  @Column({ length: 100, nullable: true, name: 'TERM' })
  term?: string;

  @Column({ length: 100, nullable: true, name: 'EXP_DATE' })
  expDate?: string;

  @Column({ length: 100, nullable: true, name: 'MONTHLY_PAY' })
  monthlyPay?: string;

  @Column({ length: 100, nullable: true, name: 'TRANSFER_DATE' })
  transferDate?: string;

  @Column({ length: 1000, nullable: true, name: 'NOTE' })
  note?: string;

  @Column({ type: 'boolean', default: false, name: 'ENABLE_F' })
  enableF!: boolean;

  @Column({ type: 'boolean', default: false, name: 'STOCK_F' })
  stockF!: boolean;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;

  @OneToMany(() => BalanceEntity, (balance) => balance.account, { lazy: true })
  balanceList!: BalanceEntity[];

  @OneToMany(() => StockBuyEntity, (stockBuy) => stockBuy.account, { lazy: true })
  stockBuyList!: StockBuyEntity[];
}

@Entity('BB_BALANCE')
export class BalanceEntity {
  @PrimaryGeneratedColumn({ name: 'BALANCE_SEQ' })
  balanceSeq!: number;

  @ManyToOne(() => AccountEntity, (account) => account.balanceList)
  @JoinColumn({ name: 'ACCOUNT_SEQ' })
  account!: AccountEntity;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column({ type: 'real', name: 'AMOUNT' })
  amount!: number;
}

@Entity('BC_CATEGORY')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ name: 'CATEGORY_SEQ' })
  categorySeq!: number;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: TransactionKind;

  @Column({ length: 100, name: 'NAME' })
  name!: string;

  @Column({ nullable: true, default: 0, name: 'PARENT_SEQ' })
  parentSeq!: number;

  @Column({ name: 'ORDER_NO' })
  orderNo!: number;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('BD_FAVORITE')
export class FavoriteEntity {
  @PrimaryGeneratedColumn({ name: 'FAVORITE_SEQ' })
  favoriteSeq!: number;

  @Column({ name: 'CATEGORY_SEQ' })
  categorySeq!: number;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: TransactionKind;

  @Column({ length: 200, name: 'TITLE' })
  title!: string;

  @Column({ nullable: true, name: 'PAY_ACCOUNT' })
  payAccount?: number;

  @Column({ nullable: true, name: 'RECEIVE_ACCOUNT' })
  receiveAccount?: number;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column('real', { nullable: true, name: 'AMOUNT' })
  amount?: number;

  @Column({ length: 200, nullable: true, name: 'NOTE' })
  note?: string;

  @Column({ nullable: true, name: 'ATTRIBUTE' })
  attribute?: number;

  @Column({ name: 'ORDER_NO' })
  orderNo!: number;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('BE_MEMO')
export class MemoEntity {
  @PrimaryGeneratedColumn({ name: 'MEMO_SEQ' })
  memoSeq!: number;

  @Column({ length: 1000, name: 'NOTE' })
  note!: string;

  @Column('date', { name: 'MEMO_DATE' })
  memoDate!: Date;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('BF_TRANSACTION')
export class TransactionEntity {
  @PrimaryGeneratedColumn({ name: 'TRANSACTION_SEQ' })
  transactionSeq!: number;

  @Column({ name: 'CATEGORY_SEQ' })
  categorySeq!: number;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: TransactionKind;

  @Column({ nullable: true, name: 'PAY_ACCOUNT' })
  payAccount?: number;

  @Column({ nullable: true, name: 'RECEIVE_ACCOUNT' })
  receiveAccount?: number;

  @Column({ nullable: true, name: 'ATTRIBUTE' })
  attribute?: number;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column('real', { name: 'AMOUNT' })
  amount!: number;

  @Column('date', { name: 'TRANSACTION_DATE' })
  transactionDate!: Date;

  @Column({ length: 100, name: 'NOTE' })
  note!: string;

  @Column('real', { nullable: true, name: 'FEE' })
  fee?: number;
}

@Entity('CA_STOCK')
export class StockEntity {
  @PrimaryGeneratedColumn({ name: 'STOCK_SEQ' })
  stockSeq!: number;

  @Column({ length: 100, name: 'NAME' })
  name!: string;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column({ name: 'STOCK_TYPE_CODE' })
  stockTypeCode!: number;

  @Column({ name: 'NATION_CODE' })
  nationCode!: number;

  @Column({ length: 200, nullable: true, name: 'LINK' })
  link?: string;

  @Column({ length: 1000, nullable: true, name: 'NOTE' })
  note?: string;

  @Column({ type: 'boolean', default: false, name: 'ENABLE_F' })
  enableF!: boolean;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;

  @OneToMany(() => StockBuyEntity, (stockBuy) => stockBuy.stock, { lazy: true })
  stockBuyList!: StockBuyEntity[];
}

@Entity('CB_STOCK_BUY')
export class StockBuyEntity {
  @PrimaryGeneratedColumn({ name: 'STOCK_BUY_SEQ' })
  stockBuySeq!: number;

  @ManyToOne(() => StockEntity, (stock) => stock.stockBuyList)
  @JoinColumn({ name: 'STOCK_SEQ' })
  stock!: StockEntity;

  @ManyToOne(() => AccountEntity, (account) => account.balanceList)
  @JoinColumn({ name: 'ACCOUNT_SEQ' })
  account!: AccountEntity;

  @Column({ name: 'QUANTITY' })
  quantity!: number;

  @Column('real', { name: 'PURCHASE_AMOUNT' })
  purchaseAmount!: number;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('CC_TRADE')
export class TradeEntity {
  @PrimaryGeneratedColumn({ name: 'TRADE_SEQ' })
  tradeSeq!: number;

  @Column({ name: 'STOCK_BUY_SEQ' })
  stockBuySeq!: number;

  @Column({ length: 100, nullable: true, name: 'NOTE' })
  note?: string;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: TradeKind;

  @Column('date', { name: 'TRADE_DATE' })
  tradeDate!: Date;

  @Column('real', { name: 'PRICE' })
  price!: number;

  @Column({ nullable: true, name: 'QUANTITY' })
  quantity?: number;

  @Column('real', { nullable: true, name: 'TAX' })
  tax?: number;

  @Column('real', { nullable: true, name: 'FEE' })
  fee?: number;

  @Column('real', { nullable: true, name: 'SELL_GAINS' })
  sellGains?: number;
}

@Entity('DA_EXCHANGE')
export class ExchangeEntity {
  @PrimaryGeneratedColumn({ name: 'EXCHANGE_SEQ' })
  exchangeSeq!: number;

  @Column({ name: 'ACCOUNT_SEQ' })
  accountSeq!: number;

  @Column({ type: 'varchar', length: 3, name: 'SELL_CURRENCY' })
  sellCurrency!: Currency;

  @Column('real', { name: 'SELL_PRICE' })
  sellPrice!: number;

  @Column({ type: 'varchar', length: 3, name: 'BUY_CURRENCY' })
  buyCurrency!: Currency;

  @Column('real', { name: 'BUY_PRICE' })
  buyPrice!: number;

  @Column('real', { nullable: true, name: 'FEE' })
  fee?: number;

  @Column('date', { name: 'EXCHANGE_DATE' })
  exchangeDate!: Date;
}

@Entity('EA_SNAPSHOT')
export class SnapshotEntity {
  @PrimaryGeneratedColumn({ name: 'SNAPSHOT_SEQ' })
  snapshotSeq!: number;

  @Column({ length: 100, name: 'NOTE' })
  note!: string;

  @Column('date', { nullable: true, name: 'STOCK_SELL_CHECK_DATE' })
  stockSellCheckDate?: Date;

  @Column('date', { name: 'REG_DATE' })
  regDate!: Date;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('EB_EXCHANGE_RATE')
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn({ name: 'EXCHANGE_RATE_SEQ' })
  exchangeRateSeq!: number;

  @Column({ name: 'SNAPSHOT_SEQ' })
  snapshotSeq!: number;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column('real', { name: 'RATE' })
  rate!: number;
}

@Entity('EB_ASSET_GROUP')
export class AssetGroupEntity {
  @PrimaryGeneratedColumn({ name: 'ASSET_GROUP_SEQ' })
  assetGroupSeq!: number;

  @Column({ name: 'SNAPSHOT_SEQ' })
  snapshotSeq!: number;

  @Column({ name: 'ACCOUNT_TYPE' })
  accountType!: number;

  @Column({ name: 'TOTAL_AMOUNT' })
  totalAmount!: number;

  @Column({ name: 'EVALUATE_AMOUNT' })
  evaluateAmount!: number;
}

@Entity('EC_STOCK_EVALUATE')
export class StockEvaluateEntity {
  @PrimaryGeneratedColumn({ name: 'STOCK_EVALUATE_SEQ' })
  stockEvaluateSeq!: number;

  @Column({ name: 'SNAPSHOT_SEQ' })
  snapshotSeq!: number;

  @Column({ name: 'STOCK_SEQ' })
  stockSeq!: number;

  @Column('real', { name: 'BUY_AMOUNT' })
  buyAmount!: number;

  @Column('real', { name: 'EVALUATE_AMOUNT' })
  evaluateAmount!: number;
}

@Entity('ZA_CODE_MAIN')
export class CodeMainEntity {
  @PrimaryColumn({ type: 'varchar', length: 20, name: 'CODE_MAIN_ID' })
  codeMainId!: CodeKind;

  @Column({ length: 100, name: 'NAME' })
  name!: string;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}

@Entity('ZB_CODE_ITEM')
export class CodeItemEntity {
  @PrimaryGeneratedColumn({ name: 'CODE_ITEM_SEQ' })
  codeItemSeq!: number;

  @Column({ type: 'varchar', length: 20, name: 'CODE_MAIN_ID' })
  codeMainId!: CodeKind;

  @Column({ length: 100, name: 'NAME' })
  name!: string;

  @Column({ name: 'ORDER_NO' })
  orderNo!: number;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;
}
