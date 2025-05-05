import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RequestServices } from '../../services/requests.service';
import { Route, Router, RouterModule } from '@angular/router';
import { ManageRequest } from '../../modals/manage-requests';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule ,NgxPaginationModule],
  templateUrl: './manage-requests.component.html',
  styleUrl: './manage-requests.component.css'
})
export class ManageRequestsComponent implements OnInit {
  requestList: ManageRequest[] = [];
  searchTerm = '';
  filterType = 0;
  filterStatus = 0;
  page: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private requestService: RequestServices,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.requestService.getAllRequests().subscribe({
      next: data => this.requestList = data,
      error: err => console.error('Error fetching requests', err)
    });
  }

  get filteredRequests(): ManageRequest[] {
    return this.requestList
      .filter(r => {
        const term = this.searchTerm.toLowerCase();
        return !this.searchTerm
          || r.requestNumber.toLowerCase().includes(term)
          || r.username.toLowerCase().includes(term);
      })
      .filter(r => !this.filterType || r.requestTypeId === this.filterType)
      .filter(r => !this.filterStatus || r.requestStatusId === this.filterStatus);
  }

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

  deleteRequest(id: number) {
    if (!confirm('Are you sure you want to delete this request?')) return;
  
    this.requestService.deleteRequest(id).subscribe({
      next: () => {
        alert('Deleted successfully');
        this.loadAll();   
        this.cdr.detectChanges(); 
      },
      error: err => console.error('Delete failed', err)
    });
  }
  
}
