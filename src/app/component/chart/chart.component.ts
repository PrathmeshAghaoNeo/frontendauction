import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, } from 'ng2-charts';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent {
  barChartOptions: ChartConfiguration['options'] = { responsive: true };
  barChartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Sales',
        data: [100, 200, 150],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
      }
    ]
  };

  // Pie Chart
  pieChartOptions: ChartConfiguration['options'] = { responsive: true };
  pieChartData = {
    labels: ['Online', 'Retail', 'Direct'],
    datasets: [
      {
        data: [350, 450, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };
}
