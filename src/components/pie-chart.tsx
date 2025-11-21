import React from "react";
import { Pie } from "react-chartjs-2";
import { ChartData } from "chart.js";

function PieChart({ chartData }: { chartData: ChartData<"pie", number[], unknown> }) {
    return (
        <div className="chart-container" >
            <h2 style={{ textAlign: "center" }}>Pie Chart</h2>
            <Pie data={chartData} />
        </div>
    );
}
export default PieChart;