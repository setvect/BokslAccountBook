import log from 'electron-log';
import AppDataSource from '../config/AppDataSource';
import { ResAccountModel } from '../../common/ResModel';
import AccountRepository from '../repository/AccountRepository';
import { Currency, CurrencyAmountModel } from '../../common/CommonType';
import { AccountForm } from '../../common/ReqModel';
import BalanceRepository from '../repository/BalanceRepository';
import { AccountEntity } from '../entity/Entity';

export default class AccountService {
  private static accountRepository = new AccountRepository(AppDataSource);

  private static balanceRepository = new BalanceRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findAccountAll() {
    const accountList = await this.accountRepository.repository.find({
      where: {
        deleteF: false,
      },
    });

    const result = accountList.map(async (account) => {
      const balanceList = (await account.balanceList).map((balance) => {
        return {
          currency: balance.currency,
          amount: balance.amount,
        } as CurrencyAmountModel;
      });

      const stockBuyPriceList = await account.stockBuyList;

      const stockBuyPriceMap = stockBuyPriceList.reduce((acc, stockBuyPrice) => {
        acc.set(stockBuyPrice.stock.currency, (acc.get(stockBuyPrice.stock.currency) || 0) + stockBuyPrice.buyAmount);
        return acc;
      }, new Map<Currency, number>());

      const stockBuyPrice = Array.from(stockBuyPriceMap, ([currency, amount]) => ({
        currency,
        amount,
      }));

      return {
        accountSeq: account.accountSeq,
        assetType: account.assetType,
        accountType: account.accountType,
        name: account.name,
        balance: balanceList,
        stockBuyPrice,
        interestRate: account.interestRate,
        term: account.term,
        accountNumber: account.accountNumber,
        monthlyPay: account.monthlyPay,
        expDate: account.expDate,
        transferDate: account.transferDate,
        note: account.note,
        enable: account.enableF,
      } as ResAccountModel;
    });
    return Promise.all(result);
  }

  static async deleteAccount(accountSeq: number) {
    await this.accountRepository.repository.update({ accountSeq }, { deleteF: true });
  }

  static async saveAccount(accountForm: AccountForm) {
    const accountEntity = this.accountRepository.repository.create({
      name: accountForm.name,
      accountNumber: accountForm.accountNumber,
      assetType: accountForm.assetType,
      accountType: accountForm.accountType,
      interestRate: accountForm.interestRate,
      term: accountForm.term,
      expDate: accountForm.expDate,
      monthlyPay: accountForm.monthlyPay,
      transferDate: accountForm.transferDate,
      note: accountForm.note,
      enableF: true,
      stockF: accountForm.stockF,
      deleteF: false,
    });
    await this.accountRepository.repository.save(accountEntity);
    this.saveBalance(accountForm, accountEntity);
  }

  static async updateAccount(accountForm: AccountForm) {
    const beforeData = await this.accountRepository.repository.findOne({ where: { accountSeq: accountForm.accountSeq } });
    if (!beforeData) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      name: accountForm.name,
      accountNumber: accountForm.accountNumber,
      assetType: accountForm.assetType,
      accountType: accountForm.accountType,
      interestRate: accountForm.interestRate,
      term: accountForm.term,
      expDate: accountForm.expDate,
      monthlyPay: accountForm.monthlyPay,
      transferDate: accountForm.transferDate,
      note: accountForm.note,
      stockF: accountForm.stockF,
    };

    await this.accountRepository.repository.save(updateData);

    // 잔고 삭제하고 다시 저장
    await this.balanceRepository.repository.delete({ account: updateData });
    this.saveBalance(accountForm, updateData);
  }

  private static saveBalance(accountForm: AccountForm, accountEntity: AccountEntity) {
    const balanceList = accountForm.balance.map((balance) => {
      return this.balanceRepository.repository.create({
        account: accountEntity,
        currency: balance.currency,
        amount: balance.amount,
      });
    });

    this.balanceRepository.repository.save(balanceList);
  }
}
