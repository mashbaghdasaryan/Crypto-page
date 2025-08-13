import React, { useEffect, useState } from "react";
import Chart from "react-google-charts";

const LineChart = ({ historicalData }) => {
  const [data, setData] = useState([["Date", "Price"]]);

  useEffect(() => {
    if (historicalData?.prices) {
      const dataCopy = [["Date", "Price"]];
      historicalData.prices.forEach(([timestamp, price]) => {
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        });
        dataCopy.push([formattedDate, price]);
      });
      setData(dataCopy);
    }
  }, [historicalData]);

  return (
    <Chart
      chartType="LineChart"
      data={data}
      height="100%"
      legendToggle
      options={{
        hAxis: { title: "" },
        vAxis: { title: "" },
        chartArea: { width: "80%", height: "70%" },
        pointSize: 5,
        tooltip: { trigger: "focus" },
      }}
    />
  );
};

export default LineChart;
