import React from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Col, Container, Row } from 'react-bootstrap';
import YearSelect from '../common/YearSelect';

function StatisticsTransaction() {
  let currentYear = new Date().getFullYear();

  function handleChangeYear(year: number) {
    currentYear = year;
    console.log(currentYear);
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
        label: '제품',
        data: labels.map(() => Math.random() * 5000000),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: '서비스',
        data: labels.map(() => Math.random() * 5000000),
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        label: '이자',
        data: labels.map(() => Math.random() * 5000000),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: '매수',
        data: labels.map(() => Math.random() * 5000000),
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
      },
      {
        label: '매도',
        data: labels.map(() => Math.random() * 5000000),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
      },
    ],
  };
  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleChangeYear(year)} />
        </Col>
      </Row>
      <Row style={{ marginTop: '15px', height: '65vh' }}>
        <Bar options={options} data={data} />
      </Row>
    </Container>
  );
}

export default StatisticsTransaction;
