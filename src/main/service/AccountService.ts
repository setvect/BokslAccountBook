import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ResAccountModel } from '../../common/ResModel';
import AccountRepository from '../repository/AccountRepository';
import { Currency, CurrencyAmountModel } from '../../common/CommonType';
import { ReqAccountModel } from '../../common/ReqModel';
import BalanceRepository from '../repository/BalanceRepository';
import { AccountEntity, BalanceEntity } from '../entity/Entity';
import StockBuyRepository from '../repository/StockBuyRepository';

export default class AccountService {
  private static accountRepository = new AccountRepository(AppDataSource);
  private static balanceRepository = new BalanceRepository(AppDataSource);
  private static stockBuyRepository = new StockBuyRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async get(accountSeq: number) {
    const account = await this.accountRepository.repository.findOne({ where: { accountSeq } });
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }
    return account;
  }

  static async findAll() {
    const accountList = await this.accountRepository.repository.find({
      order: { accountSeq: 'ASC' },
    });

    const balanceEntities = await this.balanceRepository.repository.find();
    const stockBuyEntities = await this.stockBuyRepository.repository.find();

    const result = accountList.map(async (account) => {
      const balanceList = balanceEntities
        .filter((balance) => balance.account.accountSeq == account.accountSeq)
        .map((balance) => {
          return {
            currency: balance.currency,
            amount: balance.amount,
          } as CurrencyAmountModel;
        });

      const stockBuyPriceList = stockBuyEntities.filter((stockBuy) => stockBuy.account.accountSeq === account.accountSeq);

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
        stockF: account.stockF,
        enableF: account.enableF,
        deleteF: account.deleteF,
      } as ResAccountModel;
    });
    return Promise.all(result);
  }

  static async save(accountForm: ReqAccountModel) {
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

  static async update(accountForm: ReqAccountModel) {
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
      enableF: accountForm.enableF,
    };

    await this.accountRepository.repository.save(updateData);

    // 잔고 삭제하고 다시 저장
    await this.balanceRepository.repository.delete({ account: { accountSeq: updateData.accountSeq } });
    await this.saveBalance(accountForm, beforeData);
  }

  private static async saveBalance(accountForm: ReqAccountModel, accountEntity: AccountEntity) {
    const balanceList = accountForm.balance.map((balance) => {
      return this.balanceRepository.repository.create({
        account: accountEntity,
        currency: balance.currency,
        amount: balance.amount,
      });
    });

    await this.balanceRepository.repository.save(balanceList);
  }

  /**
   * 지출, 이체, 환전, 주식 매수, 주식 매도에 따른 잔고 변화에 따른 업데이트
   * 계좌에 해당하는 통화 잔고가 없으면 잔고를 생성하고, 잔고가 있으면 잔고를 업데이트
   *
   * @param transactionalEntityManager 트랜젝션을 목적
   * @param accountSeq 계좌 일련번호
   * @param currency 통화
   * @param amount 금액(양수면 증가, 음수면 감소)
   */
  static async updateBalance(transactionalEntityManager: EntityManager, accountSeq: number, currency: Currency, amount: number) {
    const balance = await transactionalEntityManager.findOne(BalanceEntity, {
      where: {
        currency,
        account: { accountSeq },
      },
      relations: ['account'],
    });

    if (!balance) {
      await transactionalEntityManager.insert(BalanceEntity, {
        account: { accountSeq },
        currency,
        amount,
      });
    } else {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(BalanceEntity)
        .set({
          amount: () => `amount + :number`,
        })
        .where('balanceSeq = :balanceSeq', { balanceSeq: balance.balanceSeq, number: amount })
        .execute();
    }
  }

  static async delete(accountSeq: number) {
    await this.accountRepository.repository.update({ accountSeq }, { deleteF: true });
  }
}
