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

  static getWindowBounds() {
    const store = new Store();
    return store.get('windowBounds', { x: 0, y: 0, width: 2000, height: 1300 }) as Electron.Rectangle;
  }

  static saveWindowBounds(bounds: Electron.Rectangle) {
    const store = new Store();
    store.set('windowBounds', bounds);
  }
}
