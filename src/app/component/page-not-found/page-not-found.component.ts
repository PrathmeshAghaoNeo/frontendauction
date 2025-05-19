import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  // Navigate back to previous page
  goBack(): void {
    window.history.back();
  }

  // Navigate to home page
  goHome(): void {
    window.location.href = '/';
  }
}