import React from 'react';
import { Table } from 'react-bootstrap';
import { useReferenceData } from '../../state/referenceData';
import { CurrencyProperties } from '../../common/RendererModel';
import AccountMapper from '../../mapper/AccountMapper';
import { Currency } from '../../../common/CommonType';
import { convertToCommaSymbol } from '../util/util';

function AccountSummary() {
  useReferenceData();
  const totalAsset = new Map<Currency, number>();
  const debtAssets = new Map<Currency, number>();
  const stockBuyAmount = new Map<Currency, number>();
  AccountMapper.getList().forEach((account) => {
    account.balance.forEach(({ currency, amount }) => {
      totalAsset.set(currency, (totalAsset.get(currency) ?? 0) + amount);
      if (amount < 0) debtAssets.set(currency, (debtAssets.get(currency) ?? 0) + amount);
    });
    account.stockBuyPrice.forEach(({ currency, amount }) => stockBuyAmount.set(currency, (stockBuyAmount.get(currency) ?? 0) + amount));
  });
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
          {Object.values(Currency).map((currency) => (
            <td key={currency} className="right">
              {convertToCommaSymbol(totalAsset.get(currency) ?? 0, currency)}
            </td>
          ))}
        </tr>
        <tr>
          <td>주식(매입가 기준)</td>
          {Object.values(Currency).map((currency) => (
            <td key={currency} className="right">
              {convertToCommaSymbol(stockBuyAmount.get(currency) ?? 0, currency)}
            </td>
          ))}
        </tr>
        <tr>
          <td>부채</td>
          {Object.values(Currency).map((currency) => (
            <td key={currency} className="right">
              {convertToCommaSymbol(debtAssets.get(currency) ?? 0, currency)}
            </td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
}

export default AccountSummary;
