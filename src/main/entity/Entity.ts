// eslint-disable-next-line max-classes-per-file
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CodeKind, Currency, ExchangeKind, TradeKind, TransactionKind } from '../../common/CommonType';

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

  @ManyToOne(() => AccountEntity, (account) => account.balanceList, { eager: true })
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
@Index('IDX_MEMO_DATE', ['memoDate'])
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
@Index('IDX_TRANSACTION_DATE', ['transactionDate'])
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

  @Column({ name: 'ATTRIBUTE' })
  attribute!: number;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column('real', { name: 'AMOUNT' })
  amount!: number;

  @Column('date', { name: 'TRANSACTION_DATE' })
  transactionDate!: Date;

  @Column({ length: 100, name: 'NOTE' })
  note!: string;

  @Column('real', { nullable: true, name: 'FEE' })
  fee!: number;
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

  @ManyToOne(() => StockEntity, (stock) => stock.stockBuyList, { eager: true })
  @JoinColumn({ name: 'STOCK_SEQ' })
  stock!: StockEntity;

  @ManyToOne(() => AccountEntity, (account) => account.balanceList, { eager: true })
  @JoinColumn({ name: 'ACCOUNT_SEQ' })
  account!: AccountEntity;

  @Column({ name: 'QUANTITY' })
  quantity!: number;

  @Column('real', { name: 'BUY_AMOUNT' })
  buyAmount!: number;

  @Column({ type: 'boolean', default: false, name: 'DELETE_F' })
  deleteF!: boolean;

  getAveragePrice(): number {
    return this.buyAmount / this.quantity;
  }
}

@Entity('CC_TRADE')
@Index('IDX_TRADE_DATE', ['tradeDate'])
export class TradeEntity {
  @PrimaryGeneratedColumn({ name: 'TRADE_SEQ' })
  tradeSeq!: number;

  @ManyToOne(() => StockBuyEntity, { eager: true })
  @JoinColumn({ name: 'STOCK_BUY_SEQ' })
  stockBuy!: StockBuyEntity;

  @Column({ length: 100, name: 'NOTE' })
  note!: string;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: TradeKind;

  @Column('date', { name: 'TRADE_DATE' })
  tradeDate!: Date;

  @Column('real', { name: 'PRICE' })
  price!: number;

  @Column({ name: 'QUANTITY' })
  quantity!: number;

  @Column('real', { name: 'TAX' })
  tax!: number;

  @Column('real', { name: 'FEE' })
  fee!: number;

  @Column('real', { name: 'SELL_GAINS' })
  sellGains!: number;
}

@Entity('DA_EXCHANGE')
@Index('IDX_EXCHANGE_DATE', ['exchangeDate'])
export class ExchangeEntity {
  @PrimaryGeneratedColumn({ name: 'EXCHANGE_SEQ' })
  exchangeSeq!: number;

  @Column({ type: 'varchar', length: 20, name: 'KIND' })
  kind!: ExchangeKind;

  @ManyToOne(() => AccountEntity, { eager: true })
  @JoinColumn({ name: 'ACCOUNT_SEQ' })
  account!: AccountEntity;

  @Column({ length: 100, name: 'NOTE' })
  note!: string;

  @Column({ type: 'varchar', length: 3, name: 'SELL_CURRENCY' })
  sellCurrency!: Currency;

  @Column('real', { name: 'SELL_PRICE' })
  sellAmount!: number;

  @Column({ type: 'varchar', length: 3, name: 'BUY_CURRENCY' })
  buyCurrency!: Currency;

  @Column('real', { name: 'BUY_PRICE' })
  buyAmount!: number;

  @Column('real', { nullable: true, name: 'FEE' })
  fee!: number;

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

  @OneToMany(() => ExchangeRateEntity, (exchangeRate) => exchangeRate.snapshot, { lazy: true })
  exchangeRateList!: ExchangeRateEntity[];

  @OneToMany(() => AssetGroupEntity, (assetGroup) => assetGroup.snapshot, { lazy: true })
  assetGroupList!: AssetGroupEntity[];

  @OneToMany(() => StockEvaluateEntity, (stockEvaluate) => stockEvaluate.snapshot, { lazy: true })
  stockEvaluateList!: StockEvaluateEntity[];
}

@Entity('EB_EXCHANGE_RATE')
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn({ name: 'EXCHANGE_RATE_SEQ' })
  exchangeRateSeq!: number;

  @ManyToOne(() => SnapshotEntity)
  @JoinColumn({ name: 'SNAPSHOT_SEQ' })
  snapshot!: SnapshotEntity;

  @Column({ type: 'varchar', length: 3, name: 'CURRENCY' })
  currency!: Currency;

  @Column('real', { name: 'RATE' })
  rate!: number;
}

@Entity('EC_ASSET_GROUP')
export class AssetGroupEntity {
  @PrimaryGeneratedColumn({ name: 'ASSET_GROUP_SEQ' })
  assetGroupSeq!: number;

  @ManyToOne(() => SnapshotEntity)
  @JoinColumn({ name: 'SNAPSHOT_SEQ' })
  snapshot!: SnapshotEntity;

  @Column({ name: 'ACCOUNT_TYPE' })
  accountType!: number;

  @Column({ name: 'TOTAL_AMOUNT' })
  totalAmount!: number;

  @Column({ name: 'EVALUATE_AMOUNT' })
  evaluateAmount!: number;
}

@Entity('ED_STOCK_EVALUATE')
export class StockEvaluateEntity {
  @PrimaryGeneratedColumn({ name: 'STOCK_EVALUATE_SEQ' })
  stockEvaluateSeq!: number;

  @ManyToOne(() => SnapshotEntity)
  @JoinColumn({ name: 'SNAPSHOT_SEQ' })
  snapshot!: SnapshotEntity;

  @Column({ name: 'STOCK_BUY_SEQ' })
  stockBuySeq!: number;

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
