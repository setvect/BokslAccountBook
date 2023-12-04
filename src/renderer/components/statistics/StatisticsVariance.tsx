import React from 'react';
import { CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const options: ChartOptions<'line'> = {
  responsive: true,
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

function StatisticsVariance() {
  return (
    <div style={{ width: '100%', height: '65vh' }}>
      <Line options={options} data={data} />
    </div>
  );
}

export default StatisticsVariance;
