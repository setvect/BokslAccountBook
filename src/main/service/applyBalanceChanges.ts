import { EntityManager } from 'typeorm';
import { BalanceChange } from '../domain/balanceChanges';
import AccountService from './AccountService';

export default async function applyBalanceChanges(manager: EntityManager, changes: BalanceChange[]) {
  // A single SQLite connection applies changes in order inside the caller's transaction.
  // eslint-disable-next-line no-restricted-syntax
  for (const item of changes) {
    // eslint-disable-next-line no-await-in-loop
    await AccountService.updateBalance(manager, item.accountSeq, item.currency, item.amount);
  }
}
