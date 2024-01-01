/**
 * 계좌정보 맵핑
 */
import { ResAccountModel } from '../../common/ResModel';
import { Currency, CurrencyAmountModel, IPC_CHANNEL } from '../../common/CommonType';
import { convertToCommaSymbol } from '../components/util/util';

let globalAccountList: ResAccountModel[] = [];

function loadAccountList(callBack: () => void = () => {}) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallAccountLoad, (arg: any) => {
    globalAccountList = arg as ResAccountModel[];
    if (callBack) {
      callBack();
    }
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountLoad);
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
  return globalAccountList;
}

function getAccountOptionList(currency: Currency = Currency.KRW) {
  return getAccountList().map((account) => {
    let label = account.name;

    // 잔고 표시
    const selectCurrencyBalance = account.balance.find((balance) => balance.currency === currency)?.amount ?? 0;
    label += `: ${convertToCommaSymbol(selectCurrencyBalance, currency)}`;

    if (account.accountNumber) {
      label += `(${account.accountNumber})`;
    }

    return {
      value: account.accountSeq,
      label,
    };
  });
}

function getBalanceList(accountSeq: number): CurrencyAmountModel[] {
  return getAccount(accountSeq).balance;
}

const AccountMapper = {
  loadAccountMapping: loadAccountList,
  getAccount,
  getAccountName,
  getAccountList,
  getAccountOptionList,
  getBalanceList,
};

export default AccountMapper;
