/**
 * 계좌정보 맵핑
 */
import { Currency, CurrencyAmountModel, ResAccountModel } from '../common/RendererTypes';

let globalAccountList: ResAccountModel[] = [];

function loadAccountList() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalAccountList = [
    {
      accountSeq: 1,
      assetType: 4,
      accountType: 2,
      name: '현금',
      balance: [
        {
          currency: Currency.KRW,
          amount: 58000,
        },
        {
          currency: Currency.USD,
          amount: 53.25,
        },
      ],
      stockBuyPrice: [],
      interestRate: '',
      accountNumber: '',
      monthlyPay: '',
      expDate: '',
      note: '',
      enable: true,
    },
    {
      accountSeq: 2,
      assetType: 3,
      accountType: 2,
      name: '복슬통장',
      balance: [
        {
          currency: Currency.KRW,
          amount: 1000000,
        },
        {
          currency: Currency.USD,
          amount: 1000,
        },
      ],
      stockBuyPrice: [],
      interestRate: '1.0%',
      accountNumber: '123-456-789',
      monthlyPay: '-',
      expDate: '-',
      note: '복슬이 사랑해',
      enable: true,
    },
    {
      accountSeq: 3,
      assetType: 3,
      accountType: 2,
      name: '복슬통장',
      balance: [
        { currency: Currency.KRW, amount: 1000000 },
        { currency: Currency.USD, amount: 1000 },
      ],
      stockBuyPrice: [
        { currency: Currency.KRW, amount: 500000 },
        { currency: Currency.USD, amount: 500 },
      ],
      interestRate: '1.0%',
      accountNumber: '123-456-789',
      monthlyPay: '-',
      expDate: '-',
      note: '복슬이 사랑해',
      enable: false,
    },
    {
      accountSeq: 4,
      assetType: 1,
      accountType: 4,
      name: '복슬카드',
      balance: [
        { currency: Currency.KRW, amount: 1000000 },
        { currency: Currency.USD, amount: 1000 },
      ],
      stockBuyPrice: [
        { currency: Currency.KRW, amount: 500000 },
        { currency: Currency.USD, amount: 500 },
      ],
      interestRate: '1.0%',
      accountNumber: '123-456-789',
      monthlyPay: '-',
      expDate: '-',
      note: '복슬이 사랑해',
      enable: true,
    },
  ];
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
