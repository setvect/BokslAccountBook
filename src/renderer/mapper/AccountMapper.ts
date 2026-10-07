/**
 * 계좌정보 맵핑
 */
import { ResAccountModel } from '../../common/ResModel';
import { Currency, CurrencyAmountModel } from '../../common/CommonType';
import accountOptions from './accountOptions';
import { accounts } from '../state/referenceData';

const loadAccountList = accounts.load;

function getAccount(accountSeq: number): ResAccountModel {
  const account = accounts.getSnapshot().find((account) => account.accountSeq === accountSeq);
  if (!account) {
    throw new Error(`계좌번호를 찾을 수 없습니다. accountSeq: ${accountSeq}`);
  }
  return account;
}

function getAccountName(accountSeq: number) {
  return getAccount(accountSeq).name;
}

function getAccountList() {
  return accounts.getSnapshot().filter((account) => !account.deleteF);
}

function getAccountWithBalanceOptionList(currency: Currency = Currency.KRW) {
  return accountOptions(getAccountList(), true, currency);
}

function getAccountOptionForStockList(currency: Currency = Currency.KRW) {
  const list = getAccountList().filter((account) => account.stockF);
  return accountOptions(list, true, currency);
}

function getAccountOptionList() {
  return accountOptions(getAccountList(), false, Currency.KRW);
}

function getBalanceList(accountSeq: number): CurrencyAmountModel[] {
  return getAccount(accountSeq).balance;
}

function getBalanceAmount(accountSeq: number, currency: Currency): number {
  if (!accountSeq) {
    return 0;
  }
  const balanceList = getBalanceList(accountSeq);
  return balanceList.find((balance) => balance.currency === currency)?.amount ?? 0;
}

const AccountMapper = {
  loadList: loadAccountList,
  getAccount,
  getName: getAccountName,
  getList: getAccountList,
  getOptionBalanceList: getAccountWithBalanceOptionList,
  getStockOptionList: getAccountOptionForStockList,
  getOptionList: getAccountOptionList,
  getBalanceList,
  getBalanceAmount,
};

export default AccountMapper;
