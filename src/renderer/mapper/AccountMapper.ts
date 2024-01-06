/**
 * 계좌정보 맵핑
 */
import { ResAccountModel } from '../../common/ResModel';
import { Currency, CurrencyAmountModel } from '../../common/CommonType';
import { convertToCommaSymbol } from '../components/util/util';
import IpcCaller from '../common/IpcCaller';

let globalAccountList: ResAccountModel[] = [];

async function loadAccountList() {
  globalAccountList = await IpcCaller.getAccountList();
}

function getAccount(accountSeq: number): ResAccountModel {
  const account = globalAccountList.find((account) => account.accountSeq === accountSeq);
  if (!account) {
    throw new Error(`계좌번호를 찾을 수 없습니다. accountSeq: ${accountSeq}`);
  }
  return account;
}

function getAccountName(accountSeq: number) {
  return getAccount(accountSeq).name;
}

function getAccountList() {
  return globalAccountList.filter((account) => !account.deleteF);
}

function getOptionList(list: ResAccountModel[], withBalance: boolean, currency: Currency) {
  return list.map((account) => {
    let label = account.name;

    if (withBalance) {
      const selectCurrencyBalance = account.balance.find((balance) => balance.currency === currency)?.amount ?? 0;
      label += `: ${convertToCommaSymbol(selectCurrencyBalance, currency)}`;
    }

    if (account.accountNumber) {
      label += `(${account.accountNumber})`;
    }

    return {
      value: account.accountSeq,
      label,
    };
  });
}

function getAccountWithBalanceOptionList(currency: Currency = Currency.KRW) {
  return getOptionList(getAccountList(), true, currency);
}

function getAccountOptionForStockList(currency: Currency = Currency.KRW) {
  const list = getAccountList().filter((account) => account.stockF);
  return getOptionList(list, true, currency);
}

function getAccountOptionList(currency: Currency = Currency.KRW) {
  return getOptionList(getAccountList(), false, currency);
}

function getBalanceList(accountSeq: number): CurrencyAmountModel[] {
  return getAccount(accountSeq).balance;
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
};

export default AccountMapper;
