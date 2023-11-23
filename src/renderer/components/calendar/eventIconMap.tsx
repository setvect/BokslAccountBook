import React from 'react';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineDollar, AiOutlineMinusCircle, AiOutlineMinusSquare, AiOutlinePlusCircle, AiOutlinePlusSquare } from 'react-icons/ai';
import { AccountProperties, AccountType } from '../common/BokslTypes';

interface EventIconMap {
  // eslint-disable-next-line no-undef
  [key: string]: JSX.Element;
}

const eventIconMap: EventIconMap = {
  expense: (
    <>
      <AiOutlineMinusSquare color={AccountProperties[AccountType.EXPENSE].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</span>
    </>
  ),
  income: (
    <>
      <AiOutlinePlusSquare color={AccountProperties[AccountType.INCOME].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</span>
    </>
  ),
  transfer: (
    <>
      <FaExchangeAlt color={AccountProperties[AccountType.TRANSFER].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.TRANSFER].color }}>이체</span>
    </>
  ),
  stockPurchase: (
    <>
      <AiOutlinePlusCircle color={AccountProperties[AccountType.BUY].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.BUY].color }}>매수</span>
    </>
  ),
  stockSale: (
    <>
      <AiOutlineMinusCircle color={AccountProperties[AccountType.SELL].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.SELL].color }}>매도</span>
    </>
  ),
  currencyExchange: (
    <>
      <AiOutlineDollar color={AccountProperties[AccountType.EXCHANGE].color} style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: AccountProperties[AccountType.EXCHANGE].color }}>환전</span>
    </>
  ),
  memo: <FaStickyNote color={AccountProperties[AccountType.MEMO].color} style={{ marginBottom: 1 }} />,
};

export default eventIconMap;
