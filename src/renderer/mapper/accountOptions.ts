import { Currency } from '../../common/CommonType';
import { ResAccountModel } from '../../common/ResModel';
import { CurrencyProperties, OptionNumberType } from '../common/RendererModel';

/** Display projection only: the caller supplies the current account snapshot. */
export default function accountOptions(list: ResAccountModel[], withBalance: boolean, currency: Currency): OptionNumberType[] {
  return list.map((account) => {
    let label = account.name;
    if (withBalance) {
      const balance = account.balance.find((value) => value.currency === currency)?.amount ?? 0;
      const { symbol, decimalPlace } = CurrencyProperties[currency];
      label += `: ${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: decimalPlace, maximumFractionDigits: decimalPlace }).format(
        balance,
      )}`;
    }
    if (account.accountNumber) label += `(${account.accountNumber})`;
    return { value: account.accountSeq, label };
  });
}
