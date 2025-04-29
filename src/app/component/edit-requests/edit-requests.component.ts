import { Component, OnInit } from '@angular/core';
import { EditRequests } from '../../modals/edit.requests';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestServices } from '../../services/requests.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-requests',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './edit-requests.component.html',
  styleUrl: './edit-requests.component.css'
})
export class EditRequestsComponent implements OnInit {
  requestId!: number;
  requestData: EditRequests = {} as EditRequests;
  isViewMode: boolean = false; // 🆕 flag to know view vs edit mode
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestServices
  ) {}
 
  ngOnInit(): void {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
 
    // Check if it's view-only mode
    const url = this.router.url;
    if (url.includes('view')) {
      this.isViewMode = true; // ✅ User clicked on view
    }
 
    if (this.requestId === 0) {
      this.requestData = {} as EditRequests;
    } else {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (data) => (this.requestData = data),
        error: (err) => console.error('Error loading request:', err),
      });
    }
  }
 
  updateRequest(): void {
    if (this.isViewMode) return; // 🛑 No update allowed in view mode
 
    if (this.requestId === 0) {
      this.requestService.createRequest(this.requestData).subscribe({
        next: () => {
          alert('New Request Created!');
          this.router.navigate(['/requests']);
        },
        error: (err) => console.error('Error creating request:', err),
      });
    } else {
      this.requestService.updateRequest(this.requestId, this.requestData).subscribe({
        next: () => {
          alert('Request updated successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => console.error('Error updating request:', err),
      });
    }
  }
}
 