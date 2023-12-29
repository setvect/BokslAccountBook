/**
 * 계좌정보 맵핑
 */
import { ResAccountModel } from '../../common/ResModel';
import { CurrencyAmountModel, IPC_CHANNEL } from '../../common/CommonType';

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

function getAccountOptionList() {
  return getAccountList().map((account) => ({
    value: account.accountSeq,
    label: account.name,
  }));
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
