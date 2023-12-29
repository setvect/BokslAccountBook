import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { CurrencyProperties } from '../../common/RendererModel';
import AccountMapper from '../../mapper/AccountMapper';
import { Currency } from '../../../common/CommonType';
import { convertToCommaDecimal } from '../util/util';

type AccountSummaryProps = {
  activeTab: string;
};

function AccountSummary({ activeTab }: AccountSummaryProps) {
  function getCurrencyBalance() {
    return new Map<Currency, number>(Object.entries(CurrencyProperties).map(([currency, _]) => [currency as Currency, 0]));
  }

  const [totalAsset, setTotalAsset] = useState<Map<Currency, number>>(getCurrencyBalance());
  const [debtAssets, setDebtAssets] = useState<Map<Currency, number>>(getCurrencyBalance());
  const [stockBuyAmount, setStockBuyAmount] = useState<Map<Currency, number>>(getCurrencyBalance());

  function calcBalance() {
    const accountList = AccountMapper.getAccountList();
    const newTotalAsset = getCurrencyBalance();
    const newDebtAssets = getCurrencyBalance();

    accountList
      .flatMap((account) => account.balance)
      .forEach((balance) => {
        const { currency, amount } = balance;
        const balanceAmount = newTotalAsset.get(currency) || 0;
        newTotalAsset.set(currency, balanceAmount + amount);

        if (amount < 0) {
          const debtAmount = newDebtAssets.get(currency) || 0;
          newDebtAssets.set(currency, debtAmount + amount);
        }
      });
    setTotalAsset(newTotalAsset);
    setDebtAssets(newDebtAssets);
  }

  function calcStockBuyAmount() {
    const accountList = AccountMapper.getAccountList();
    const newStockBuyAmount = getCurrencyBalance();

    accountList
      .flatMap((account) => account.stockBuyPrice)
      .forEach((balance) => {
        const { currency, amount } = balance;
        const balanceAmount = newStockBuyAmount.get(currency) || 0;
        newStockBuyAmount.set(currency, balanceAmount + amount);
      });
    setStockBuyAmount(newStockBuyAmount);
  }

  useEffect(
    () => {
      calcBalance();
      calcStockBuyAmount();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab],
  );
  return (
    <Table striped bordered hover style={{ width: 'auto' }} className="table-th-center">
      <thead>
        <tr>
          <th>카테고리</th>
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <th key={currency}>
              {name}({symbol})
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>자산(부채 마이너스 적용)</td>
          {Object.entries(CurrencyProperties).map(([currency, { symbol }]) => (
            <td key={currency} className="right">
              {symbol}
              {convertToCommaDecimal(totalAsset.get(currency as Currency), CurrencyProperties[currency as Currency].decimalPlace)}
            </td>
          ))}
        </tr>
        <tr>
          <td>주식(매입가 기준)</td>
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <td key={currency} className="right">
              {symbol} {convertToCommaDecimal(stockBuyAmount.get(currency as Currency), CurrencyProperties[currency as Currency].decimalPlace)}
            </td>
          ))}
        </tr>
        <tr>
          <td>부채</td>
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <td key={currency} className="right">
              {symbol}
              {convertToCommaDecimal(debtAssets.get(currency as Currency), CurrencyProperties[currency as Currency].decimalPlace)}
            </td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
}

export default AccountSummary;
