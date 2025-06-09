import { Component, Input } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { Color } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-auction-bar-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './auction-bar-chart.component.html',
})
export class AuctionBarChartComponent {
  @Input() chartData: any[] = [];

  get barChartData() {
    return this.chartData.map(item => ({
      name: `${item.month}-${item.year}`,
      value: item.totalAmount
    }));
  }


  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Revenue (BHD)';
  colorScheme = { domain: ['#5AA454'] };
}
