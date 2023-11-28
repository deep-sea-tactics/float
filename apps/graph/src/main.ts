import "./app.css";
import { Chart } from "chart.js/auto";

const canvas = document.querySelector("canvas")!;

const data = [12, 19, 3, 5, 2, 3];

new Chart(canvas, {
  type: "line",
  data: {
    labels: Array.from({ length: data.length }, (_, i) => i).map(String),
    datasets: [{
      label: "Depth",
      data,
      tension: 0.2
    }],
  },
});
