import AppDataSource from '../config/AppDataSource';
import { ResAccountModel } from '../../common/ResModel';
import AccountRepository from '../repository/AccountRepository';
import { Currency, CurrencyAmountModel } from '../../common/CommonType';

export default class AccountService {
  private static accountRepository = new AccountRepository(AppDataSource);

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
      const stockBuyPriceMap = new Map<Currency, number>();
      stockBuyPriceList.forEach((stockBuyPrice) => {
        const buyPrice = stockBuyPriceMap.get(stockBuyPrice.stock.currency);
        if (buyPrice) {
          stockBuyPriceMap.set(stockBuyPrice.stock.currency, buyPrice + stockBuyPrice.purchaseAmount);
        } else {
          stockBuyPriceMap.set(stockBuyPrice.stock.currency, stockBuyPrice.purchaseAmount);
        }
      });

      const stockBuyPrice = Array.from(stockBuyPriceMap).map((stockBuyPrice) => {
        return {
          currency: stockBuyPrice[0],
          amount: stockBuyPrice[1],
        } as CurrencyAmountModel;
      });

      return {
        accountSeq: account.accountSeq,
        assetType: account.assetType,
        accountType: account.accountType,
        name: account.name,
        balance: balanceList,
        stockBuyPrice,
        interestRate: account.interestRate,
        accountNumber: account.accountNumber,
        monthlyPay: account.monthlyPay,
        expDate: account.expDate,
        note: account.note,
        enable: account.enableF,
      } as ResAccountModel;
    });
    return Promise.all(result);
  }
}
