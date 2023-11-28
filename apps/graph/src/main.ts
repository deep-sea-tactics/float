import "./app.css";
import { Chart } from "chart.js/auto";

const canvas = document.querySelector("canvas")!;

new Chart(canvas, {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
    }],
  }
});
