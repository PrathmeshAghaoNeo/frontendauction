import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EditRequests } from '../../modals/edit.requests';
import { RequestServices } from '../../services/requests.service';
 
@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-requests.component.html',
})
export class EditRequestsComponent implements OnInit {
  requestId!: number;
  requestData: EditRequests = {} as EditRequests;
  isViewMode: boolean = false; 
  mode: string = 'view';
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestServices,
    private location: Location
  ) {}
 
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'view';
    });
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
 
    // Check if it's view-only mode
    const url = this.router.url;
    this.isViewMode = url.includes('view'); // If URL contains 'view', set to view mode
 
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
    if (this.isViewMode) return; // 🛑 Prevent updates in view mode
 
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
 
  goBack(): void {
    this.location.back(); 
  }
 
  // 🔥 Paste here below 👇
getTypeName(typeId: number): string {
  switch (typeId) {
    case 1: return 'Transfer of Ownership';
    case 2: return 'Inquiry';
    case 3: return 'Request for Viewing';
    case 4: return 'Offer';
    default: return 'Unknown';
  }
}
 
getStatusName(statusId: number): string {
  switch (statusId) {
    case 1: return 'Pending';
    case 2: return 'Done';
    case 3: return 'Approved';
    case 4: return 'Rejected';
    default: return 'Unknown';
  }
}
 
 
allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
 
}
 