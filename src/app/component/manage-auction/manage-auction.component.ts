import { Component, OnInit, ViewEncapsulation, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../services/auction.service';
import { Router, RouterModule } from '@angular/router';
import { Auction } from '../../modals/auctions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-auction',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-auction.component.html',
  styleUrls: ['./manage-auction.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAuctionComponent implements OnInit {

  auctions: Auction[] = [];
  allAuctions: Auction[] = [];
  selectedAuction: Auction | null = null;
  searchText: string = '';
  filterCategory: number = 0;
  filterStatus: number = 0;
  auctionForm!: FormGroup;
  currentDateTime: string = new Date().toISOString().slice(0, 16);
  page: number = 1;
  itemsPerPage: number = 5;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  defaultAuctions: Auction[] = [];
  
  categories = [
    { categoryId: 1, categoryName: 'Electronics' },
    { categoryId: 2, categoryName: 'Vehicles' },
    { categoryId: 3, categoryName: 'Furniture' },
    { categoryId: 4, categoryName: 'Collectibles' },
    { categoryId: 5, categoryName: 'Real Estate' },
    { categoryId: 6, categoryName: 'Fashion' },
    { categoryId: 7, categoryName: 'Industrial Equipment' },
    { categoryId: 8, categoryName: 'Books & Media' },
    { categoryId: 9, categoryName: 'Sports & Outdoors' },
    { categoryId: 10, categoryName: 'Toys & Games' }
  ];

  statuses = [
    { statusId: 1, statusName: 'Active' },
    { statusId: 2, statusName: 'Pending' },
    { statusId: 3, statusName: 'Closed' },
    { statusId: 4, statusName: 'Completed' }
  ];

  @ViewChild('viewAuctionModal') viewAuctionModal!: TemplateRef<any>;

  constructor(
    private auctionService: AuctionService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeAuctionForm();
    this.fetchAuctions();
  }

  // -------------------------------
  // Fetch Data & Form Setup
  // -------------------------------

  initializeAuctionForm(): void {
    this.auctionForm = this.fb.group({
      auctionNumber: ['', [Validators.required, Validators.pattern('^AUC\\d{5}$')]],
      title: ['', [Validators.required, Validators.maxLength(10)]],
      type: ['', [Validators.required]],
      statusId: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      startDateTime: ['', [Validators.required]],
      endDateTime: ['', [Validators.required]],
      incrementalTime: ['', [Validators.required, Validators.min(1)]],
    });
  }

  loading = false;

fetchAuctions(): void {
  this.loading = true;
  this.auctionService.getAllAuctions().subscribe({
    next: (data) => {
      this.allAuctions = data;
      this.auctions = data.sort((a, b) => b.auctionId - a.auctionId);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      Swal.fire('Error!', 'Failed to load auctions.', 'error');
    }
  });
}

sortAuctions(column: string): void {
  if (this.sortColumn === column) {
    if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      this.sortDirection = '';
    } else {
      this.sortDirection = 'asc';
    }
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  if (this.sortDirection === '') {
    this.auctions = [...this.defaultAuctions];
    this.applyFilters(); // reapply filters if needed
    return;
  }

  const dir = this.sortDirection === 'asc' ? 1 : -1;
  this.auctions.sort((a, b) => {
    const valA = (a as any)[column]?.toString().toLowerCase();
    const valB = (b as any)[column]?.toString().toLowerCase();

    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });
}




  // -------------------------------
  // Filters & Search
  // -------------------------------

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const category = Number(this.filterCategory);
    const status = Number(this.filterStatus);

    this.auctions = this.allAuctions.filter(auction => {
      const matchesSearch = !search || auction.title.toLowerCase().includes(search);
      const matchesCategory = category === 0 || auction.categoryId === category;
      const matchesStatus = status === 0 || auction.statusId === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

 
  getStatusName(statusId: number): string {
    return this.statuses.find(s => s.statusId === statusId)?.statusName || 'Unknown';
  }
  

  // -------------------------------
  // Modal Actions
  // -------------------------------

  openViewModal(auction: Auction): void {
    this.selectedAuction = auction;
    this.modalService.open(this.viewAuctionModal, { centered: true, size: 'xl', backdrop: 'static' });
  }
  navigateToEdit(auction: Auction): void {
    this.router.navigate(['/update-auction', auction.auctionId]);
  }
  
  openDeleteModal(auction: Auction): void {
    this.selectedAuction = auction;

    Swal.fire({
      title: `Delete this Auction ?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAuctionConfirmed();
      }
    });
  }

  deleteAuctionConfirmed(): void {
    if (!this.selectedAuction) {
      Swal.fire('Error', 'No auction selected.', 'error');
      return;
    }
    

    this.auctionService.deleteAuction(this.selectedAuction.auctionId).subscribe({
      next: () => {
        this.auctions = this.auctions.filter(a => a.auctionId !== this.selectedAuction?.auctionId);
        this.selectedAuction = null;
        Swal.fire('Deleted!', 'Auction has been deleted.', 'success');
      },
      error: err => {
        console.error('Error deleting auction', err);
        Swal.fire('Error!', 'Failed to delete auction.', 'error');
      }
    });
  }
}
