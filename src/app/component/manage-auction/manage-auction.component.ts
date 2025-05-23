import { Component, OnInit, ViewEncapsulation, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../services/auction.service';
import { Router, RouterModule } from '@angular/router';
import { Auction } from '../../modals/auctions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { AssetCategory } from '../../modals/assetcategories';

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
  categories: AssetCategory[] = [];
  


  statuses = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Completed' },
    { statusId: 4, statusName: 'Cancelled' }
  ];

  @ViewChild('viewAuctionModal') viewAuctionModal!: TemplateRef<any>;

  constructor(
    private auctionService: AuctionService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private assetCategoriesService: AssetCategoriesService,
  ) { }

  ngOnInit(): void {
    this.initializeAuctionForm();
    this.fetchAuctions();
    this.assetCategoriesService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Failed to load categories', err);
    }
  });
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
  fetchCategories(): void {
  this.assetCategoriesService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Error fetching categories', err);
      Swal.fire('Error!', 'Failed to load categories.', 'error');
    }
  });
}

  sortAuctions(column: string): void {
    console.log("functioncalled");

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
      this.applyFilters();
      return;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.auctions.sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];

      if (column.includes('Date') || column.includes('date')) {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();

        if (dateA < dateB) return -1 * dir;
        if (dateA > dateB) return 1 * dir;
        return 0;
      }

      const strA = valA?.toString().toLowerCase();
      const strB = valB?.toString().toLowerCase();

      if (strA < strB) return -1 * dir;
      if (strA > strB) return 1 * dir;
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
  exportToExcel(): void {
    const exportData = this.allAuctions.map(auc => ({
      'Auction Title': auc.title,
      'Auction Type': auc.type,
      'Status': auc.statusName,
      'Category': auc.categoryName,
      'Start Date/Time': new Date(auc.startDateTime).toLocaleString(),
      'End Date/Time': new Date(auc.endDateTime).toLocaleString(),
      'Incremental Time': auc.incrementalTime + ' sec',


    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'ListofAllAuctions': worksheet },
      SheetNames: ['ListofAllAuctions']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'ListofAllAuctions.xlsx');
  }
}
