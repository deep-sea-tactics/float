import "./app.css";
import { Chart } from "chart.js/auto";

const canvas = document.querySelector("canvas")!;
let count = 0;

const chart = new Chart(canvas, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Depth",
      data: [],
      tension: 0.2
    }],
  },
});

function addData(chart: Chart<"line", number[], string>, label: string, newData: number) {
  chart.data.labels?.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(newData);
  });
  chart.update();
}

window.addEventListener("keypress", (event) => {
  if (event.key == "Enter") {
    addData(chart, count.toString(), parseInt(prompt("Enter the Number")!));
    count++;
  }
})