/**
 * 계좌정보 맵핑
 */
import { Currency, ResAccountModel } from '../type/BokslTypes';

let globalAccountList: ResAccountModel[] = [];

export function loadAccountList() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalAccountList = [
    {
      accountSeq: 1,
      kindName: '현금',
      accountTypeName: '현금',
      name: '현금',
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
      interestRate: '',
      accountNumber: '',
      monthlyPay: '',
      expDate: '',
      note: '',
      enableF: true,
    },
    {
      accountSeq: 2,
      kindName: '복슬통장',
      accountTypeName: '복슬통장',
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
      interestRate: '',
      accountNumber: '',
      monthlyPay: '',
      expDate: '',
      note: '',
      enableF: true,
    },
  ];
}

export function getAccount(accountSeq: number): ResAccountModel {
  const account = globalAccountList.find((account) => account.accountSeq === accountSeq);
  if (!account) {
    throw new Error(`계좌번호를 찾을 수 없습니다. accountSeq: ${accountSeq}`);
  }
  return account;
}

export function getAccountName(accountSeq: number) {
  return getAccount(accountSeq).name;
}

export function getAccountList() {
  return globalAccountList;
}
