import React from "react";
import { Pie } from "react-chartjs-2";
import { ChartData } from "chart.js";
import { Chart, ArcElement } from 'chart.js'

function PieChart({ title, chartData }: { title?: string, chartData: ChartData<"pie", number[], unknown> }) {
    Chart.register(ArcElement);
    
    return (
        <div className="chart-container" >
            {title && <h2 style={{ textAlign: "center" }}>{title}</h2>}
            <Pie data={chartData} />
        </div>
    );
}
export default PieChart;