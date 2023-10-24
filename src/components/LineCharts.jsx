import { LineChart } from "@mui/x-charts"

const LineCharts = ({title, data}) => {
  return (
    <LineChart
			xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
			series={[
				{
					data: data,
				},
			]}
			width={500}
			height={300}
		/>
  )
}

export default LineCharts