import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

export interface DatabaseStartupResult {
  applied: string[];
  backupPath?: string;
}

/** Initialize without synchronization, back up before any schema write, then migrate. */
export default async function initializeDatabase(dataSource: DataSource): Promise<DatabaseStartupResult> {
  if (dataSource.options.synchronize || dataSource.options.migrationsRun) throw new Error('자동 스키마 변경을 끈 DataSource가 필요합니다.');
  if (dataSource.isInitialized) return { applied: [] };
  let backupPath: string | undefined;
  try {
    await dataSource.initialize();
    const migrationTable: unknown[] = await dataSource.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'migrations'");
    const executed: { name: string }[] = migrationTable.length ? await dataSource.query('SELECT name FROM migrations ORDER BY id') : [];
    const expected = dataSource.migrations.map((migration) => migration.name || migration.constructor.name);
    if (executed.some((migration) => !expected.includes(migration.name)))
      throw new Error('이 앱보다 새로운 DB 버전입니다. 최신 앱으로 실행해 주세요.');
    if (expected.every((name) => executed.some((migration) => migration.name === name))) return { applied: [] };

    const tables: unknown[] = await dataSource.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'",
    );
    if (tables.length && dataSource.options.type === 'sqlite' && dataSource.options.database !== ':memory:') {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const candidate = `${dataSource.options.database}.before-migration-${stamp}-${randomUUID()}.bak`;
      // SQLite's snapshot includes WAL contents and does not overwrite an existing file.
      await dataSource.query('VACUUM INTO ?', [candidate]);
      backupPath = candidate;
    }
    const applied = await dataSource.runMigrations({ transaction: 'all' });
    return { applied: applied.map((migration) => migration.name), backupPath };
  } catch (error) {
    if (dataSource.isInitialized) await dataSource.destroy();
    const detail = error instanceof Error ? error.message : String(error);
    const recovery = backupPath ? ` 업그레이드 전 백업: ${backupPath}. 앱을 종료한 뒤 백업 파일로 DB를 복원할 수 있습니다.` : '';
    throw new Error(`DB 초기화 또는 업그레이드에 실패했습니다: ${detail}.${recovery}`);
  }
}
