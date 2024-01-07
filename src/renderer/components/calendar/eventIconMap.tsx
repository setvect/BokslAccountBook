import React from 'react';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineDollar, AiOutlineMinusCircle, AiOutlineMinusSquare, AiOutlinePlusCircle, AiOutlinePlusSquare } from 'react-icons/ai';
import { AccountType } from '../../common/RendererModel';

type EventIconMap = {
  [key in AccountType]: React.ReactElement;
};

const eventIconMap: EventIconMap = {
  SPENDING: (
    <>
      <AiOutlineMinusSquare className="account-spending" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-spending">지출</span>
    </>
  ),
  INCOME: (
    <>
      <AiOutlinePlusSquare className="account-income" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-income">수입</span>
    </>
  ),
  TRANSFER: (
    <>
      <FaExchangeAlt className="account-transfer" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-transfer">이체</span>
    </>
  ),
  BUY: (
    <>
      <AiOutlinePlusCircle className="account-buy" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-buy">매수</span>
    </>
  ),
  SELL: (
    <>
      <AiOutlineMinusCircle className="account-sell" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-sell">매도</span>
    </>
  ),
  EXCHANGE_BUY: (
    <>
      <AiOutlineDollar className="account-exchange-buy" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-exchange">원화매수</span>
    </>
  ),
  EXCHANGE_SELL: (
    <>
      <AiOutlineDollar className="account-exchange-sell" style={{ marginBottom: 1, marginRight: 1 }} />
      <span className="account-exchange">원화매도</span>
    </>
  ),
  MEMO: <FaStickyNote className="account-memo" style={{ marginBottom: 1 }} />,
};

export default eventIconMap;
