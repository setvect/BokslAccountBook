import React, { useCallback, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Col, Container, Row } from 'react-bootstrap';
import _ from 'lodash';
import YearSelect from '../common/YearSelect';
import { Currency, TradeKind, TransactionKind } from '../../../common/CommonType';
import CurrencySelect from '../financial/CurrencySelect';
import IpcCaller from '../../common/IpcCaller';
import { ResTradeSum, ResTransactionSum } from '../../../common/ResModel';

function StatisticsTransaction() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currency, setCurrency] = useState<Currency>(Currency.KRW);
  const [transactionMonthlyAmount, setTransactionMonthlyAmount] = useState<ResTransactionSum[]>([]);
  const [tradeMonthlyAmount, setTradeMonthlyAmount] = useState<ResTradeSum[]>([]);

  const handleYearChange = (year: number) => {
    setYear(year);
  };

  function handleCurrencyChange(currency: Currency) {
    setCurrency(currency);
  }

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: false,
      },
    },
  };

  const labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const data = {
    labels,
    datasets: [
      {
        label: '지출',
        data: _.range(1, 13).map(
          (month) =>
            transactionMonthlyAmount.find((item) => {
              return item.kind === TransactionKind.SPENDING && item.transactionDate.getMonth() + 1 === month;
            })?.amount || 0,
        ),
        backgroundColor: '#00bb33bb',
      },
      {
        label: '수입',
        data: _.range(1, 13).map(
          (month) =>
            transactionMonthlyAmount.find((item) => {
              return item.kind === TransactionKind.INCOME && item.transactionDate.getMonth() + 1 === month;
            })?.amount || 0,
        ),
        backgroundColor: '#ff99ccbb',
      },
      {
        label: '이체',
        data: _.range(1, 13).map(
          (month) =>
            transactionMonthlyAmount.find((item) => {
              return item.kind === TransactionKind.TRANSFER && item.transactionDate.getMonth() + 1 === month;
            })?.amount || 0,
        ),
        backgroundColor: '#66ccffbb',
        hidden: true,
      },
      {
        label: '매수',
        data: _.range(1, 13).map((month) => {
          const trade = tradeMonthlyAmount.find((item) => {
            return item.kind === TradeKind.BUY && item.tradeDate.getMonth() + 1 === month;
          });
          return trade?.amount || 0;
        }),
        backgroundColor: '#ff8f75bb',
        hidden: true,
      },
      {
        label: '매도',
        data: _.range(1, 13).map((month) => {
          const trade = tradeMonthlyAmount.find((item) => {
            return item.kind === TradeKind.SELL && item.tradeDate.getMonth() + 1 === month;
          });
          return trade?.amount || 0;
        }),
        backgroundColor: '#7fafffaa',
        hidden: true,
      },
    ],
  };

  const loadStatistics = useCallback(async () => {
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    const transactionMonthlyAmount = await IpcCaller.getTransactionMonthlyAmountSum({
      from,
      to,
      currency,
    });
    setTransactionMonthlyAmount(transactionMonthlyAmount);

    const tradeMonthlyAmount: ResTradeSum[] = await IpcCaller.getTradeMonthlyAmountSum({
      from,
      to,
      currency,
    });
    setTradeMonthlyAmount(tradeMonthlyAmount);
  }, [year, currency]);

  useEffect(() => {
    (async () => {
      await loadStatistics();
    })();
  }, [loadStatistics]);

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleYearChange(year)} />
          <span style={{ marginLeft: '15px' }} />
          <CurrencySelect onChange={(currency) => handleCurrencyChange(currency)} />
        </Col>
      </Row>
      <Row style={{ marginTop: '15px', height: '65vh' }}>
        <Bar options={options} data={data} />
      </Row>
    </Container>
  );
}

export default StatisticsTransaction;
