import React, { useEffect, useState } from 'react';
import { CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { NumericFormat } from 'react-number-format';
import YearSelect from '../common/YearSelect';
import { Currency } from '../../../common/CommonType';
import { convertToCommaSymbol } from '../util/util';
import IpcCaller from '../../common/IpcCaller';
import { ReqAssetTrend } from '../../../common/ReqModel';

function StatisticsVariance() {
  const [year, setYear] = useState<number>(new Date().getFullYear() - 5);

  const handleYearChange = (year: number) => {
    setYear(year);
  };

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      filler: {
        propagate: true,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const labels = ['2014-1', '2014-2', '2014-3', /* ... */ '2021-12'];
  const data: ChartData<'line', (number | null)[], string> = {
    labels,
    datasets: [
      {
        label: '자산 변화',
        data: labels.map(() => Math.random() * 1000000),
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  useEffect(() => {
    (async () => {
      const req: ReqAssetTrend = {
        startDate: new Date(year, 0, 1),
        exchangeRate: [
          { currency: Currency.USD, amount: 1100.25 },
          { currency: Currency.JPY, amount: 10 },
        ],
      };
      const assetTrend = await IpcCaller.getAssetTrend(req);
      console.log('assetTrend', assetTrend);
    })();
  }, [year]);

  return (
    <Container fluid className="ledger-table">
      <Form>
        <Row className="align-items-center">
          <Col xs="auto">
            <InputGroup>
              <InputGroup.Text>시작년</InputGroup.Text>
              <YearSelect onChange={(year) => handleYearChange(year)} />
            </InputGroup>
          </Col>
          {Object.values(Currency)
            .filter((currency) => currency !== Currency.KRW)
            .map((currency) => {
              return (
                <Col xs="auto" key={currency}>
                  <InputGroup>
                    <InputGroup.Text>
                      {currency} {convertToCommaSymbol(1, currency)}
                    </InputGroup.Text>
                    <NumericFormat maxLength={7} className="form-control" style={{ textAlign: 'right', width: '100px' }} />
                    <InputGroup.Text>원</InputGroup.Text>
                  </InputGroup>
                </Col>
              );
            })}
          <Col xs="auto">
            <Button>조회</Button>
          </Col>
        </Row>
      </Form>
      <Row style={{ marginTop: '15px', height: '65vh' }}>
        <Line options={options} data={data} />
      </Row>
    </Container>
  );
}

export default StatisticsVariance;
