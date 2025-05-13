import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, } from 'ng2-charts';
import { UserView } from '../../modals/user';
// import dayjs from 'dayjs';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit {
  // user: UserView[] = []; // This should be filled from your backend API
 user:any[] = [];
  pieChartOptions: ChartConfiguration['options'] = { responsive: true };
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  ngOnInit(): void {
    // simulate API response for demo
    this.user = this.getDummyUsers(); 
    this.prepareChartData();
  }

  prepareChartData(): void {
    const weeklyCount: Record<string, number> = {};

    // for (const u of this.user) {
    //   const week = dayjs(u.registrationDate).isoweek();
    //   const year = dayjs(u.registrationDate).isoWeekYear();
    //   const label = `Week ${week} (${year})`;

    //   weeklyCount[label] = (weeklyCount[label] || 0) + 1;
    // }

    const labels = Object.keys(weeklyCount);
    const data = Object.values(weeklyCount);
    const colors = labels.map(() => this.randomColor());

    this.pieChartData = {
      labels,
      datasets: [{ data, backgroundColor: colors }]
    };
  }

  randomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},0.7)`;
  }

  // Dummy users for testing
  getDummyUsers(): any[] {
    return [
      { id: 1, name: 'John', registrationDate: '2025-05-01T10:00:00Z' },
      { id: 2, name: 'Sara', registrationDate: '2025-05-02T15:00:00Z' },
      { id: 3, name: 'Ali', registrationDate: '2025-05-10T09:00:00Z' },
      { id: 4, name: 'Maya', registrationDate: '2025-05-11T20:00:00Z' },
      { id: 5, name: 'Tina', registrationDate: '2025-05-17T08:00:00Z' },
    ];
  }
}