// import { Component, OnInit, OnDestroy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { Component, OnInit, OnDestroy, DoCheck, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { RequestServices } from '../../services/requests.service';
import { UserService } from '../../services/user.service';
import { ManageAssetService } from '../../services/asset.service';
import { Router, RouterModule } from '@angular/router';
import { ManageRequest } from '../../modals/manage-requests';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'; 
import { NgxPaginationModule } from 'ngx-pagination';
import { UserView } from '../../modals/user';
import { Asset } from '../../modals/manage-asset';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';  

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgbModalModule],
  templateUrl: './manage-requests.component.html',
  styleUrl: './manage-requests.component.css'
})
export class ManageRequestsComponent implements OnInit, OnDestroy, DoCheck {
  requestList: ManageRequest[] = [];
  defaultRequests: ManageRequest[] = []; 
  filteredRequests: ManageRequest[] = [];
  userList: UserView[] = [];
  assetList: Asset[] = [];
  searchTerm = '';
  filterType = 0;
  filterStatus = 0;
  
  // Sort properties - updated to support three-state sorting
  sortColumn: string = 'requestDateTime'; // Default sort by date
  sortDirection: string = 'desc'; // Default sort direction (newest first)
  
  // Advanced filters
  showFilters = false;
  filters = {
    requestNumber: '',
    userId: '',
    username: '',
    assetId: '',
    requestTypeId: 0,
    requestStatusId: 0,
    fromDate: null as Date | null,
    toDate: null as Date | null
  };
  
  // Change detection variables
  private refreshSubscription: Subscription | null = null;
  isLoading = false;
  processingDelete = false;
  deleteError = '';
  deleteSuccess = '';
  isExporting = false;
  page: number = 1;
  itemsPerPage: number = 5;


  @ViewChild('viewRequestModal') viewRequestModal!: TemplateRef<any>;  // ViewChild for the modal
  selectedRequest!: ManageRequest | null;                              

  
  constructor(
    private requestService: RequestServices,
    private userService: UserService,
    private assetService: ManageAssetService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal 
  ) {}

  ngOnInit(): void {
    // Load users and assets first
    this.loadUsers();
    this.loadAssets(); 
    
    // Subscribe to the refresh signal - only refresh when changes are detected
    this.refreshSubscription = this.requestService.requestsRefresh$.subscribe(
      refresh => {
        if (refresh) {
          this.loadAll();
        }
      }
    );
  }


  
  openViewModal(request: ManageRequest): void {
    this.selectedRequest = request;
    this.modalService.open(this.viewRequestModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static'
    });
  }

  navigateToEdit(request: ManageRequest): void {
    this.router.navigate(['/request-detail', request.requestId]);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  ngDoCheck(): void {
    // Only trigger change detection when needed to improve performance
    if (this.processingDelete || this.deleteError || this.deleteSuccess || this.isExporting) {
      this.cdr.detectChanges();
    }
  }

  trackByRequestId(index: number, item: ManageRequest): number {
    return item.requestId;
  }

  // Load all users to get the UID for each userId
  private loadUsers(): void {
    this.userService.getAllUser().subscribe({
      next: (users) => {
        this.userList = users;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load user data. Some user information may not display correctly.',
          icon: 'warning',
          timer: 3000
        });
      }
    });
  }

  // Load all assets to display asset titles
  private loadAssets(): void {
    this.isLoading = true; // Show loading indicator while fetching assets
    
    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assetList = assets;
        // Now that assets are loaded, load the requests
        this.loadAll();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching assets', err);
        this.isLoading = false;
        
        // Show error notification using SweetAlert
        Swal.fire({
          title: 'Error',
          text: 'Failed to load asset data. Some asset names may not display correctly.',
          icon: 'warning',
          timer: 3000
        });
        
        // Still load requests, even if assets failed
        this.loadAll();
        this.cdr.detectChanges();
      }
    });
  }

  // Get UID from userId
  getUserUid(userId: number): string {
    const user = this.userList.find(u => u.userId === userId);
    return user ? user.uid.toString() : userId.toString();
  }

  // Get asset title from assetId with better fallback
  getAssetTitle(assetId: number): string {
    // First try to find the asset in our list
    const asset = this.assetList.find(a => a.assetId === assetId);
    
    if (asset && asset.title) {
      return asset.title;
    }
    

    return `Asset #${assetId}`;
  }

  private loadAll(): void {
    this.isLoading = true;
    this.deleteError = '';
    this.deleteSuccess = '';
    
    this.requestService.getAllRequests().subscribe({
      next: data => {
        // Store the raw data 
        this.requestList = data;
        this.defaultRequests = [...data]; // Keep a reference to unsorted data
        
        // Apply proper sorting BEFORE filtering
        this.applyFiltersToList(); 
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: err => {
        console.error('Error fetching requests', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // Updated sortBy method with three-state sorting logic
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Cycle through sort states: asc -> desc -> none
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = ''; // Empty string indicates no sorting
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      // New column, start with ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    // If no sorting is selected, revert to default ordering
    if (this.sortDirection === '') {
      this.requestList = [...this.defaultRequests];
    }
    
    // Apply the sort and filters
    this.applyFiltersToList();
  }

  // Updated sorting function based on sortColumn and sortDirection
  private sortRequests(requests: ManageRequest[]): ManageRequest[] {
    // If no sort direction specified, return the original array
    if (this.sortDirection === '') {
      return [...requests];
    }
    
    return [...requests].sort((a, b) => {
      let comparison = 0;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      
      // Sort based on selected column
      switch(this.sortColumn) {
        case 'requestNumber':
          // Use natural sort for request numbers
          comparison = this.naturalSortCompare(
            a.requestNumber || '', 
            b.requestNumber || ''
          );
          break;
          
        case 'userId':
          // Sort by userId numerically
          comparison = (a.userId || 0) - (b.userId || 0);
          break;
          
        case 'username':
          // Sort by username (alphabetically)
          comparison = (a.username || '').localeCompare(b.username || '', undefined, { sensitivity: 'base' });
          break;
          
        case 'assetId':
          // Sort by assetId numerically
          comparison = (a.assetId || 0) - (b.assetId || 0);
          break;
          
        case 'requestTypeId':
          // Sort by request type
          comparison = (a.requestTypeId || 0) - (b.requestTypeId || 0);
          break;
          
        case 'requestStatusId':
          // Sort by request status
          comparison = (a.requestStatusId || 0) - (b.requestStatusId || 0);
          break;
          
        case 'requestDateTime':
        default:
          // Default sort by date
          const dateA = new Date(a.requestDateTime).getTime();
          const dateB = new Date(b.requestDateTime).getTime();
          comparison = dateB - dateA; // Newest first by default
          break;
      }
      
      // Apply sort direction
      return comparison * dir;
    });
  }
  
  // Natural sort function for alphanumeric values
  private naturalSortCompare(a: string, b: string): number {
    // Split strings into chunks of text and numbers
    const aParts = a.match(/([0-9]+|[^0-9]+)/g) || [];
    const bParts = b.match(/([0-9]+|[^0-9]+)/g) || [];
    
    // Compare each chunk
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
      const aIsNumber = !isNaN(parseInt(aParts[i]));
      const bIsNumber = !isNaN(parseInt(bParts[i]));
      
      // If both are numbers, compare as numbers
      if (aIsNumber && bIsNumber) {
        const diff = parseInt(aParts[i]) - parseInt(bParts[i]);
        if (diff !== 0) return diff;
      } 
      // If both are strings, compare case-insensitive
      else if (!aIsNumber && !bIsNumber) {
        const diff = aParts[i].localeCompare(bParts[i], undefined, { sensitivity: 'base' });
        if (diff !== 0) return diff;
      }
      // If one is a number and one is a string, numbers come first
      else {
        return aIsNumber ? -1 : 1;
      }
    }
    
    // If all compared parts are equal, shorter strings come first
    return aParts.length - bParts.length;
  }
  
  // Toggle filter panel visibility
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    
    if (this.showFilters) {
      this.filters.requestTypeId = this.filterType;
      this.filters.requestStatusId = this.filterStatus;
    }
  }
  
  resetFilters(): void {
    this.filters = {
      requestNumber: '',
      userId: '',
      username: '',
      assetId: '',
      requestTypeId: 0,
      requestStatusId: 0,
      fromDate: null,
      toDate: null
    };
    
    this.searchTerm = '';
    this.filterType = 0;
    this.filterStatus = 0;
    
    this.applyFiltersToList();
  }
  
  // Apply advanced filters and hide panel
  applyAdvancedFilters(): void {
    // Sync simple filters with advanced filters for consistency
    this.filterType = this.filters.requestTypeId;
    this.filterStatus = this.filters.requestStatusId;
    
    this.applyFiltersToList();
    this.showFilters = false; // Hide filter panel after applying
  }
  
  // Apply filters to the list - called automatically when Type or Status filters change
  applyFiltersToList(): void {
    // Update the advanced filters to match the quick filters
    this.filters.requestTypeId = this.filterType;
    this.filters.requestStatusId = this.filterStatus;
    
    // First apply all filters
    let filtered = this.requestList.filter(r => {
      // Basic search term (applies across multiple fields)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesSearch = 
          (r.requestNumber && r.requestNumber.toLowerCase().includes(term)) ||
          (r.username && r.username.toLowerCase().includes(term)) ||
          this.getTypeName(r.requestTypeId).toLowerCase().includes(term) ||
          this.getStatusName(r.requestStatusId).toLowerCase().includes(term) ||
          this.getAssetTitle(r.assetId).toLowerCase().includes(term); // Add search by asset title
          
        if (!matchesSearch) return false;
      }
      
      // Quick filters - Type
      if (this.filterType > 0 && r.requestTypeId !== this.filterType) {
        return false;
      }
      
      // Quick filters - Status
      if (this.filterStatus > 0 && r.requestStatusId !== this.filterStatus) {
        return false;
      }
      
      // Advanced filters
      if (this.filters.requestNumber && r.requestNumber && 
          !r.requestNumber.toLowerCase().includes(this.filters.requestNumber.toLowerCase())) {
        return false;
      }
      
      if (this.filters.userId && r.userId && 
          !this.getUserUid(r.userId).toLowerCase().includes(this.filters.userId.toLowerCase())) {
        return false;
      }
      
      if (this.filters.username && r.username && 
          !r.username.toLowerCase().includes(this.filters.username.toLowerCase())) {
        return false;
      }
      
      if (this.filters.assetId && r.assetId) {
        const assetTitle = this.getAssetTitle(r.assetId).toLowerCase();
        const searchTerm = this.filters.assetId.toLowerCase();
        if (!assetTitle.includes(searchTerm) && !r.assetId.toString().includes(searchTerm)) {
          return false;
        }
      }
      
      // Date range filters
      if (this.filters.fromDate) {
        const fromDate = new Date(this.filters.fromDate);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        const requestDate = new Date(r.requestDateTime);
        if (requestDate < fromDate) return false;
      }
      
      if (this.filters.toDate) {
        const toDate = new Date(this.filters.toDate);
        toDate.setHours(23, 59, 59, 999); // End of day
        const requestDate = new Date(r.requestDateTime);
        if (requestDate > toDate) return false;
      }
      
      return true;
    });
    
    // Then apply sorting AFTER filtering
    this.filteredRequests = this.sortRequests(filtered);
    
    this.cdr.detectChanges();
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

  // Updated delete method with SweetAlert2
  deleteRequest(id: number, requestNumber: string): void {
    // Use SweetAlert2 for confirmation instead of browser confirm
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete request #${requestNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      // If user clicked "Yes"
      if (result.isConfirmed) {
        // Set processing flag to prevent multiple clicks
        this.processingDelete = true;
        this.deleteError = '';
        this.deleteSuccess = '';
        this.cdr.detectChanges(); // Force UI update immediately
        
        // Remove the item locally first for immediate UI feedback
        const index = this.requestList.findIndex(r => r.requestId === id);
        const deletedItem = index !== -1 ? { ...this.requestList[index] } : null; 
        
        if (index !== -1) {
          this.requestList.splice(index, 1);
          this.applyFiltersToList(); 
          this.cdr.detectChanges();
        }

        // Store deletedRequestNumber to handle edge cases
        const deletedRequestNumber = requestNumber;

        try {
          this.requestService.deleteRequest(id)
            .pipe(
              finalize(() => {
                this.processingDelete = false;
                this.cdr.detectChanges();
              })
            )
            .subscribe({
              next: (response) => {
                console.log('Delete successful:', response);
                
                // Success notification with SweetAlert2
                Swal.fire({
                  title: 'Deleted!',
                  text: `Request #${deletedRequestNumber} has been deleted.`,
                  icon: 'success',
                  timer: 2000,
                  timerProgressBar: true
                });
                
               
              },
              error: (err) => {
                console.error('Delete API error:', err);
                
                // If the error contains status code 200 or 204, it means deletion was actually successful
                // This happens in some API implementations (204 No Content is common for DELETE)
                if (err.status === 200 || err.status === 204) {
                  Swal.fire({
                    title: 'Deleted!',
                    text: `Request #${deletedRequestNumber} has been deleted.`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true
                  });
                } else {
                  // Real error happened - show error alert
                  Swal.fire({
                    title: 'Error!',
                    text: `Failed to delete request #${deletedRequestNumber}. Please try again.`,
                    icon: 'error'
                  });
                  
                  // Add the item back since delete failed
                  if (deletedItem && index !== -1) {
                    this.requestList.splice(index, 0, deletedItem);
                    this.applyFiltersToList(); // Update filtered list
                  }
                }
              }
            });
        } catch (ex) {
          console.error('Exception during delete:', ex);
          this.processingDelete = false;
          
          // Show error alert
          Swal.fire({
            title: 'Error!',
            text: 'Error processing request. Please try again.',
            icon: 'error'
          });
          
          // Add the item back since delete failed
          if (deletedItem && index !== -1) {
            this.requestList.splice(index, 0, deletedItem);
            this.applyFiltersToList(); // Update filtered list
          }
          
          this.cdr.detectChanges();
        }
      }
    });
  }
  
  // Export data to Excel
  exportToExcel(): void {
    this.isExporting = true;
    
    try {
      // data for export - convert to appropriate format for Excel
      const exportData = this.filteredRequests.map(r => {
        return {
          'Request Number': r.requestNumber,
          'User ID': this.getUserUid(r.userId),
          'Username': r.username,
          'Asset ID': r.assetId,
          'Asset Title': this.getAssetTitle(r.assetId), // Add asset title to export
          'Type': this.getTypeName(r.requestTypeId),
          'Date & Time': new Date(r.requestDateTime).toLocaleString(),
          'Status': this.getStatusName(r.requestStatusId)
        };
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
      
      // Generate file name with date
      const now = new Date();
      const fileName = `ListofAllRequests.xlsx`;
      
      // Save file
      XLSX.writeFile(workbook, fileName);
      
      console.log('Export successful');
    } catch (error) {
      console.error('Error exporting data:', error);
      
      // Use SweetAlert for error notification
      Swal.fire({
        title: 'Export Failed',
        text: 'Failed to export data. Please try again.',
        icon: 'error'
      });
    } finally {
      this.isExporting = false;
      this.cdr.detectChanges();
    }
  }
}