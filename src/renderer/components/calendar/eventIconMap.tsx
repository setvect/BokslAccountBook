import React from 'react';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineDollar, AiOutlineMinusCircle, AiOutlineMinusSquare, AiOutlinePlusCircle, AiOutlinePlusSquare } from 'react-icons/ai';

interface EventIconMap {
  // eslint-disable-next-line no-undef
  [key: string]: JSX.Element;
}

const eventIconMap: EventIconMap = {
  spending: (
    <>
      <AiOutlineMinusSquare className="account-spending" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-spending">지출</span>
    </>
  ),
  income: (
    <>
      <AiOutlinePlusSquare className="account-income" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-income">수입</span>
    </>
  ),
  transfer: (
    <>
      <FaExchangeAlt className="account-transfer" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-transfer">이체</span>
    </>
  ),
  stockBuy: (
    <>
      <AiOutlinePlusCircle className="account-buy" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-buy">매수</span>
    </>
  ),
  stockSale: (
    <>
      <AiOutlineMinusCircle className="account-sell" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-sell">매도</span>
    </>
  ),
  currencyExchange: (
    <>
      <AiOutlineDollar className="account-exchange" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-exchange">환전</span>
    </>
  ),
  memo: <FaStickyNote className="account-memo" style={{ marginBottom: 1 }} />,
};

export default eventIconMap;
