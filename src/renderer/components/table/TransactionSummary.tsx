import React from 'react';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToCommaSymbol } from '../util/util';
import { ResTransactionModel } from '../../../common/ResModel';
import { Currency, TransactionKind } from '../../../common/CommonType';

interface TransactionSummaryProps {
  transactionList: ResTransactionModel[];
}

function TransactionSummary({ transactionList }: TransactionSummaryProps) {
  const calculateSumByType = (kind: TransactionKind) => {
    const filteredList = transactionList.filter((transaction) => transaction.kind === kind);
    return Object.values(Currency)
      .map((currency) => {
        const sum = filteredList.reduce((acc, transaction) => {
          return transaction.currency === currency ? acc + transaction.amount : acc;
        }, 0);
        return { currency, amount: sum };
      })
      .filter((currencySum) => currencySum.amount !== 0);
  };

  const spendingSum = calculateSumByType(TransactionKind.SPENDING);
  const incomeSum = calculateSumByType(TransactionKind.INCOME);
  const transferSum = calculateSumByType(TransactionKind.TRANSFER);

  const incomeSubtractSpending = Object.values(Currency)
    .filter((currency) => {
      const incomeAmount = incomeSum.find((sum) => sum.currency === currency);
      const spendingAmount = spendingSum.find((sum) => sum.currency === currency);
      return incomeAmount || spendingAmount;
    })
    .map((currency) => {
      const incomeAmount = incomeSum.find((sum) => sum.currency === currency)?.amount || 0;
      const spendingAmount = spendingSum.find((sum) => sum.currency === currency)?.amount || 0;
      return { currency, amount: incomeAmount - spendingAmount };
    });

  return (
    <tbody>
      {spendingSum.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-spending">지출({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
      {incomeSum.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-income">수입({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
      {incomeSubtractSpending.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-income">수입({CurrencyProperties[currencySum.currency].name})</span> -
            <span className="account-spending">지출({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
      {transferSum.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-transfer"> 이체({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
    </tbody>
  );
}

export default TransactionSummary;
