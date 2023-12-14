import React from 'react';
import { Table } from 'react-bootstrap';
import { CurrencyProperties } from '../../common/BokslTypes';

function AccountSummary() {
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
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <td key={currency}>{symbol} 100,200</td>
          ))}
        </tr>
        <tr>
          <td>주식(매입가 기준)</td>
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <td key={currency}>{symbol} 100,200</td>
          ))}
        </tr>
        <tr>
          <td>부채</td>
          {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
            <td key={currency}>{symbol} 100,200</td>
          ))}
        </tr>
      </tbody>
    </Table>
  );
}

export default AccountSummary;
