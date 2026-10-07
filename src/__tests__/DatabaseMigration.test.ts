// TypeORM migrations implement stateless instance methods.
/* eslint class-methods-use-this: off */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { DataSource, MigrationInterface, QueryRunner } from 'typeorm';
import createDataSource from '../main/config/createDataSource';
import initializeDatabase from '../main/config/initializeDatabase';
import Baseline1791370000000 from '../main/migrations/Baseline1791370000000';
import FractionalQuantity1791370000001 from '../main/migrations/FractionalQuantity1791370000001';
import IntegerQuantity1791370000002 from '../main/migrations/IntegerQuantity1791370000002';
import legacy from '../main/migrations/legacy-schema.json';
import { AccountEntity, StockEntity, StockBuyEntity, TradeEntity } from '../main/entity/Entity';
import { Currency, TradeKind } from '../common/CommonType';

class IntentionalFailure1791370000003 implements MigrationInterface {
  name = 'IntentionalFailure1791370000003';

  async up(runner: QueryRunner): Promise<void> {
    await runner.query("UPDATE BA_ACCOUNT SET NAME = 'must roll back'");
    throw new Error('intentional migration failure');
  }

  async down(): Promise<void> {
    throw new Error('not supported');
  }
}

describe('database upgrades', () => {
  let directory: string;
  let filename: string;
  let opened: DataSource[];
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'boksl-migration-'));
    filename = path.join(directory, 'book.db');
    opened = [];
  });
  afterEach(async () => {
    await Promise.all(opened.filter((ds) => ds.isInitialized).map((ds) => ds.destroy()));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  function source() {
    const ds = createDataSource(filename);
    opened.push(ds);
    return ds;
  }
  async function legacyDatabase() {
    const ds = source();
    await ds.initialize();
    // eslint-disable-next-line no-restricted-syntax
    for (const object of legacy.objects) {
      // eslint-disable-next-line no-await-in-loop
      await ds.query(object.sql);
    }
    await ds.manager.insert(AccountEntity, { accountSeq: 1, name: 'preserve me', accountType: 1, assetType: 1 });
    await ds.manager.insert(StockEntity, { stockSeq: 1, name: 'stock', stockTypeCode: 1, nationCode: 1, currency: Currency.USD });
    await ds.manager.insert(StockBuyEntity, { stockBuySeq: 1, account: { accountSeq: 1 }, stock: { stockSeq: 1 }, quantity: 3, buyAmount: 30 });
    await ds.manager.insert(TradeEntity, {
      tradeSeq: 1,
      stockBuy: { stockBuySeq: 1 },
      kind: TradeKind.BUY,
      quantity: 3,
      price: 100,
      fee: 0,
      tax: 0,
      sellGains: 0,
      note: 'original',
      tradeDate: '2026-01-01',
    });
    return ds;
  }
  async function dump(ds: DataSource) {
    return Promise.all(
      legacy.tables.map(async (table) => ({ table: table.name, rows: await ds.query(`SELECT * FROM "${table.name}" ORDER BY rowid`) })),
    );
  }

  it('creates a fresh database through migrations and matches current entity metadata', async () => {
    const ds = source();
    const result = await initializeDatabase(ds);
    expect(result.applied).toHaveLength(3);
    expect(result.backupPath).toBeUndefined();
    await Promise.all(
      ['CB_STOCK_BUY', 'CC_TRADE'].map(async (name) => {
        expect((await ds.query(`PRAGMA table_info(${name})`)).find((column: { name: string }) => column.name === 'QUANTITY').type).toBe('INTEGER');
      }),
    );
    expect((await ds.driver.createSchemaBuilder().log()).upQueries).toEqual([]);
    expect(await ds.query('PRAGMA foreign_key_check')).toEqual([]);
    expect(await ds.query('PRAGMA foreign_keys')).toEqual([{ foreign_keys: 1 }]);
  });

  it('backs up and preserves all legacy rows, integer quantities, triggers, indexes and sequence numbers', async () => {
    const old = await legacyDatabase();
    await old.query("UPDATE sqlite_sequence SET seq = 100 WHERE name IN ('CB_STOCK_BUY', 'CC_TRADE')");
    await old.query('CREATE INDEX user_quantity_index ON CB_STOCK_BUY(QUANTITY)');
    await old.query(
      "CREATE TRIGGER user_trade_trigger AFTER INSERT ON CC_TRADE BEGIN UPDATE CC_TRADE SET NOTE = 'trigger applied' WHERE TRADE_SEQ = NEW.TRADE_SEQ; END",
    );
    const before = await dump(old);
    await old.destroy();
    const ds = source();
    const result = await initializeDatabase(ds);
    expect(fs.existsSync(result.backupPath!)).toBe(true);
    expect(await dump(ds)).toEqual(before);
    expect((await ds.manager.findOneByOrFail(StockBuyEntity, { stockBuySeq: 1 })).quantity).toBe(3);
    expect((await ds.manager.findOneByOrFail(TradeEntity, { tradeSeq: 1 })).quantity).toBe(3);
    expect(await ds.query("SELECT seq FROM sqlite_sequence WHERE name = 'CC_TRADE'")).toEqual([{ seq: 100 }]);
    expect(await ds.query("SELECT name FROM sqlite_master WHERE name = 'user_quantity_index'")).toHaveLength(1);
    await ds.manager.insert(TradeEntity, {
      stockBuy: { stockBuySeq: 1 },
      kind: TradeKind.BUY,
      quantity: 1,
      price: 100,
      fee: 0,
      tax: 0,
      sellGains: 0,
      note: 'new',
      tradeDate: '2026-01-02',
    });
    expect(await ds.query('SELECT TRADE_SEQ, NOTE FROM CC_TRADE WHERE TRADE_SEQ > 1')).toEqual([{ TRADE_SEQ: 101, NOTE: 'trigger applied' }]);
    const backup = createDataSource(result.backupPath!);
    opened.push(backup);
    await backup.initialize();
    expect(await dump(backup)).toEqual(before);
    expect((await backup.query('PRAGMA table_info("CC_TRADE")')).find((column: { name: string }) => column.name === 'QUANTITY').type).toBe('INTEGER');
  });

  it('does not rerun migrations or make another backup on restart', async () => {
    const old = await legacyDatabase();
    await old.destroy();
    const first = source();
    await initializeDatabase(first);
    await first.destroy();
    const second = source();
    expect(await initializeDatabase(second)).toEqual({ applied: [] });
    expect(await second.query('SELECT name FROM migrations')).toHaveLength(3);
    expect(fs.readdirSync(directory).filter((name) => name.endsWith('.bak'))).toHaveLength(1);
  });

  it('rolls back failed migrations, closes the database and supports restoring the backup', async () => {
    const old = await legacyDatabase();
    const before = await dump(old);
    await old.destroy();
    const ds = source();
    ds.setOptions({
      migrations: [Baseline1791370000000, FractionalQuantity1791370000001, IntegerQuantity1791370000002, IntentionalFailure1791370000003],
    });
    await expect(initializeDatabase(ds)).rejects.toThrow('업그레이드 전 백업:');
    expect(ds.isInitialized).toBe(false);
    const afterFailure = source();
    await afterFailure.initialize();
    expect(await dump(afterFailure)).toEqual(before);
    expect(await afterFailure.query('SELECT * FROM migrations')).toHaveLength(0);
    await afterFailure.destroy();
    const backup = fs.readdirSync(directory).find((name) => name.endsWith('.bak'))!;
    fs.copyFileSync(path.join(directory, backup), filename);
    const restored = source();
    await initializeDatabase(restored);
    expect(await dump(restored)).toEqual(before);
  });

  async function realDatabase() {
    const ds = await legacyDatabase();
    await ds.destroy();
    ds.setOptions({ migrations: [Baseline1791370000000, FractionalQuantity1791370000001] });
    await initializeDatabase(ds);
    return ds;
  }

  it('returns an already migrated REAL database to INTEGER without losing data or history', async () => {
    const old = await realDatabase();
    await old.query("UPDATE sqlite_sequence SET seq = 200 WHERE name IN ('CB_STOCK_BUY', 'CC_TRADE')");
    await old.query('CREATE INDEX user_quantity_index ON CB_STOCK_BUY(QUANTITY)');
    await old.query(
      "CREATE TRIGGER user_trade_trigger AFTER INSERT ON CC_TRADE BEGIN UPDATE CC_TRADE SET NOTE = 'trigger applied' WHERE TRADE_SEQ = NEW.TRADE_SEQ; END",
    );
    const before = await dump(old);
    await old.destroy();
    const ds = source();
    const result = await initializeDatabase(ds);
    expect(result.applied).toEqual(['IntegerQuantity1791370000002']);
    expect(fs.existsSync(result.backupPath!)).toBe(true);
    expect(await dump(ds)).toEqual(before);
    expect(await ds.query('SELECT name FROM migrations')).toHaveLength(3);
    expect((await ds.driver.createSchemaBuilder().log()).upQueries.map((query) => query.query)).toEqual(['DROP INDEX "user_quantity_index"']);
    expect(await ds.query("SELECT seq FROM sqlite_sequence WHERE name = 'CC_TRADE'")).toEqual([{ seq: 200 }]);
    expect(await ds.query("SELECT name FROM sqlite_master WHERE name IN ('user_quantity_index', 'user_trade_trigger')")).toHaveLength(2);
    expect(await ds.query('PRAGMA foreign_key_check')).toEqual([]);
  });

  it.each(['CB_STOCK_BUY', 'CC_TRADE'])('refuses fractional values in %s without truncating or changing either table', async (table) => {
    const old = await realDatabase();
    await old.query(`UPDATE ${table} SET QUANTITY = 0.5`);
    const before = await dump(old);
    await old.destroy();
    const ds = source();
    await expect(initializeDatabase(ds)).rejects.toThrow('정수가 아닌 수량');
    expect(ds.isInitialized).toBe(false);
    const unchanged = source();
    await unchanged.initialize();
    expect(await dump(unchanged)).toEqual(before);
    expect(await unchanged.query('SELECT name FROM migrations')).toHaveLength(2);
    expect((await unchanged.query('PRAGMA table_info("CC_TRADE")')).find((column: { name: string }) => column.name === 'QUANTITY').type).toBe('REAL');
    expect((await unchanged.query('PRAGMA table_info("CB_STOCK_BUY")')).find((column: { name: string }) => column.name === 'QUANTITY').type).toBe(
      'REAL',
    );
  });

  it('rejects unsupported legacy schemas while keeping a recoverable backup', async () => {
    const old = await legacyDatabase();
    await old.query('ALTER TABLE BA_ACCOUNT ADD COLUMN UNKNOWN_FIELD TEXT');
    await old.destroy();
    const ds = source();
    await expect(initializeDatabase(ds)).rejects.toThrow('지원하지 않는 기존 DB 구조');
    expect(ds.isInitialized).toBe(false);
    expect(fs.readdirSync(directory).filter((name) => name.endsWith('.bak'))).toHaveLength(1);
  });
});
