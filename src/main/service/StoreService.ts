import { Currency, ExchangeRateModel } from '../../common/CommonType';
import Store from 'electron-store';

type CurrencyKeysToNumbers = {
  [key in Currency]: number;
};

export default class StoreService {
  static getExchangeRate() {
    const defaultExchangeRate: CurrencyKeysToNumbers = {} as CurrencyKeysToNumbers;
    defaultExchangeRate[Currency.USD] = 1300;
    defaultExchangeRate[Currency.JPY] = 10;

    const store = new Store({
      defaults: {
        exchangeRate: defaultExchangeRate,
      },
    });

    const rate: ExchangeRateModel[] = [];
    Object.values(Currency).forEach((currency) => {
      rate.push({
        currency,
        rate: store.get(`exchangeRate.${currency}`, 1),
      });
    });
    return rate;
  }

  static saveCurrencyRate(exchangeRate: ExchangeRateModel[]) {
    const store = new Store();
    exchangeRate.forEach((rate) => {
      store.set(`exchangeRate.${rate.currency}`, rate.rate);
    });
  }
}
