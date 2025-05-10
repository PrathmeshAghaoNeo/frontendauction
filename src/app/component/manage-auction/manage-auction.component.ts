import { Component, OnInit, ViewEncapsulation, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../services/auction.service';
import { RouterModule } from '@angular/router';
import { Auction } from '../../modals/auctions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-auction',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule, ReactiveFormsModule],
  templateUrl: './manage-auction.component.html',
  styleUrls: ['./manage-auction.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAuctionComponent implements OnInit {
  auctions: Auction[] = [];
  selectedAuction: Auction | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  auctionForm!: FormGroup;
  statuses = []; // Example list of statuses, replace with actual data
  categories = []; // Example list of categories, replace with actual data
  currentDateTime: string = new Date().toISOString().slice(0, 16); // Current date-time for "datetime-local"

  @ViewChild('viewAuctionModal') viewAuctionModal!: TemplateRef<any>;
  @ViewChild('editAuctionModal') editAuctionModal!: TemplateRef<any>;


  

  constructor(
    private auctionService: AuctionService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchAuctions();
    this.initializeAuctionForm(); // Initialize auction form
  }

  // Initialize the auction form with validators
  initializeAuctionForm(): void {
    this.auctionForm = this.fb.group({
      auctionNumber: ['', [Validators.required, Validators.pattern('^AUC\\d{5}$')]],
      title: ['', [Validators.required, Validators.maxLength(10)]],
      type: ['', [Validators.required]],
      statusId: ['', [Validators.required]], // statusId instead of statusName
      categoryId: ['', [Validators.required]], // categoryId instead of categoryName
      startDateTime: ['', [Validators.required]],
      endDateTime: ['', [Validators.required]],
      incrementalTime: ['', [Validators.required, Validators.min(1)]],
    });
  }
  

  // Fetch auctions (replace with actual implementation)
  fetchAuctions(): void {
    this.auctionService.getAllAuctions().subscribe({
      next: (data) => {
        this.auctions = data;
      },
      error: (err) => {
        console.error('Error fetching auctions', err);
        Swal.fire('Error!', 'Failed to load auctions.', 'error');
      }
    });
  }

  // Open View Auction Modal
  openViewModal(auction: Auction): void {
    this.selectedAuction = auction;
    this.modalService.open(this.viewAuctionModal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  // Open Edit Auction Modal
  openEditModal(auction: Auction): void {
    this.selectedAuction = auction;
    this.auctionForm.patchValue({
      auctionNumber: auction.auctionNumber,
      title: auction.title,
      type: auction.type,
      statusId: auction.statusId,
      categoryId: auction.categoryId,
      startDateTime: auction.startDateTime,
      endDateTime: auction.endDateTime,
      incrementalTime: auction.incrementalTime,
    });

    this.modalService.open(this.editAuctionModal, { centered: true, size: 'lg' });
  }

  // Submit the edited auction data
  submitEdit(): void {
    if (this.auctionForm.invalid || !this.selectedAuction) return;
  
    const updatedAuction: Auction = {
      ...this.selectedAuction,
      ...this.auctionForm.value,
    };
  
    this.auctionService.updateAuction(updatedAuction.auctionId, updatedAuction).subscribe({
      next: () => {
        Swal.fire('Success', 'Auction updated successfully!', 'success');
        this.modalService.dismissAll();
        this.fetchAuctions();
      },
      error: () => {
        Swal.fire('Error', 'Failed to update auction.', 'error');
      }
    });
  }
  

  // Open Delete Auction Modal
  openDeleteModal(auction: Auction): void {
    this.selectedAuction = auction;

    Swal.fire({
      title: `Delete "${auction.title}"?`,
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

  // Confirm deletion of auction
  deleteAuctionConfirmed(): void {
    if (!this.selectedAuction) return;

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
