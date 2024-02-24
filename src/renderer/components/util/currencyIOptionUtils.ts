import { Currency } from '../../../common/CommonType';
import { CurrencyProperties } from '../../common/RendererModel';
import AccountMapper from '../../mapper/AccountMapper';
import { convertToCommaSymbol } from './util';

function getBalanceInfo(accountSeq: number | null | undefined, currency: Currency | null | undefined) {
  let balanceInfo = '';
  if (accountSeq && currency) {
    const balanceAmount = AccountMapper.getBalanceAmount(accountSeq, currency);
    balanceInfo = `(잔고: ${convertToCommaSymbol(balanceAmount, currency)})`;
  }
  return balanceInfo;
}

export function getCurrencyOptionList(withOutCurrency: Currency | null | undefined = null, accountSeq: number | null | undefined = null) {
  return Object.entries(CurrencyProperties)
    .filter(([currency]) => currency !== withOutCurrency)
    .map(([currency, { name, symbol }]) => {
      const balanceInfo = getBalanceInfo(accountSeq, currency as Currency);
      return {
        value: currency,
        label: `${name} ${balanceInfo}`,
      };
    });
}
