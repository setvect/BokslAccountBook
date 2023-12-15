import React from 'react';
import { CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Col, Container, Row } from 'react-bootstrap';
import YearSelect from '../common/YearSelect';

function StatisticsVariance() {
  let currentYear = new Date().getFullYear();

  function handleYearChange(year: number) {
    currentYear = year;
    console.log(currentYear);
  }

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

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleYearChange(year)} />
        </Col>
      </Row>
      <Row style={{ marginTop: '15px', height: '65vh' }}>
        <Line options={options} data={data} />
      </Row>
    </Container>
  );
}

export default StatisticsVariance;
