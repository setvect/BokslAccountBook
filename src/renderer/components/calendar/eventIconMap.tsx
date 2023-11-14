import React from 'react';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineMinusSquare, AiOutlinePlusSquare, AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineDollar } from 'react-icons/ai';

interface EventIconMap {
  // eslint-disable-next-line no-undef
  [key: string]: JSX.Element;
}

const eventIconMap: EventIconMap = {
  expense: (
    <>
      <AiOutlineMinusSquare color="#00bb33" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#00bb33' }}>지출</span>
    </>
  ),
  income: (
    <>
      <AiOutlinePlusSquare color="#ff99cc" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#ff99cc' }}>수입</span>
    </>
  ),
  transfer: (
    <>
      <FaExchangeAlt color="#66ccff" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#66ccff' }}>이체</span>
    </>
  ),
  stockPurchase: (
    <>
      <AiOutlinePlusCircle color="#f51818" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#ee2727' }}>매수</span>
    </>
  ),
  stockSale: (
    <>
      <AiOutlineMinusCircle color="#1b61d1" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#1b61d1' }}>매도</span>
    </>
  ),
  currencyExchange: (
    <>
      <AiOutlineDollar color="#add8e6" style={{ marginBottom: 1, marginRight: 1 }} />
      <span style={{ color: '#add8e6' }}>환전</span>
    </>
  ),
  memo: <FaStickyNote color="grey" style={{ marginBottom: 1 }} />,
};

export default eventIconMap;
