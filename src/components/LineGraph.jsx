import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'

const LineGraph = ({ chartData }) => {
  return (
    <Bar data={ chartData }/>
  )
}

export default LineGraph