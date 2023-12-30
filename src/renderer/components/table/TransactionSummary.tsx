import { Table } from 'react-bootstrap';
import React from 'react';
import { CurrencyProperties, CurrencySumModel } from '../../common/RendererModel';
import { convertToCommaSymbol } from '../util/util';
import { ResTransactionModel } from '../../../common/ResModel';
import { Currency, TransactionKind } from '../../../common/CommonType';

interface TransactionSummaryProps {
  transactionList: ResTransactionModel[];
}

function TransactionSummary({ transactionList }: TransactionSummaryProps) {
  const getCurrencySum = (transactionList: ResTransactionModel[]) => {
    // 통화별 합계
    const currencySumList: CurrencySumModel[] = [];
    Object.values(Currency).forEach((currency) => {
      const sum = transactionList.reduce((acc, transaction) => {
        if (transaction.currency === currency) {
          return acc + transaction.amount;
        }
        return acc;
      }, 0);
      if (sum > 0) {
        currencySumList.push({ currency, amount: sum });
      }
    });
    return currencySumList;
  };

  const getSpendingSum = () => {
    const spendingList = transactionList.filter((transaction) => transaction.kind === TransactionKind.SPENDING);
    return getCurrencySum(spendingList);
  };

  const getIncomeSum = () => {
    const incomeList = transactionList.filter((transaction) => transaction.kind === TransactionKind.INCOME);
    return getCurrencySum(incomeList);
  };

  const getTransferSum = () => {
    const transferList = transactionList.filter((transaction) => transaction.kind === TransactionKind.TRANSFER);
    return getCurrencySum(transferList);
  };

  const getIncomeSubtractSpending = () => {
    const incomeList = getIncomeSum();
    const spendingList = getSpendingSum();

    const currencySet = new Set<Currency>();

    incomeList.forEach((income) => {
      currencySet.add(income.currency);
    });

    spendingList.forEach((spending) => {
      currencySet.add(spending.currency);
    });

    const incomeSubtractSpendingList: CurrencySumModel[] = [];

    currencySet.forEach((currency) => {
      const income = incomeList.find((income) => income.currency === currency);
      const incomeAmount = income ? income.amount : 0;

      const spending = spendingList.find((spending) => spending.currency === currency);
      const spendingAmount = spending ? spending.amount : 0;

      const incomeSubtractSpending = incomeAmount - spendingAmount;
      incomeSubtractSpendingList.push({ currency, amount: incomeSubtractSpending });
    });

    return incomeSubtractSpendingList;
  };

  return (
    <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
      <tbody>
        {getSpendingSum().map((currencySum) => (
          <tr key={currencySum.currency}>
            <td>
              <span className="account-spending">지출({CurrencyProperties[currencySum.currency].name})</span>
            </td>
            <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
          </tr>
        ))}
        {getIncomeSum().map((currencySum) => (
          <tr key={currencySum.currency}>
            <td>
              <span className="account-income">수입({CurrencyProperties[currencySum.currency].name})</span>
            </td>
            <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
          </tr>
        ))}
        {getIncomeSubtractSpending().map((currencySum) => (
          <tr key={currencySum.currency}>
            <td>
              <span className="account-income">수입({CurrencyProperties[currencySum.currency].name})</span> -
              <span className="account-spending">지출({CurrencyProperties[currencySum.currency].name})</span>
            </td>
            <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
          </tr>
        ))}
        {getTransferSum().map((currencySum) => (
          <tr key={currencySum.currency}>
            <td>
              <span className="account-transfer"> 이체({CurrencyProperties[currencySum.currency].name})</span>
            </td>
            <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default TransactionSummary;
