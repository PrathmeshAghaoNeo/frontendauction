import { Component, OnInit, ViewEncapsulation, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../services/auction.service';
import { RouterModule } from '@angular/router';
import { Auction } from '../../modals/auctions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var window: any;

@Component({
  selector: 'app-manage-auction',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-auction.component.html',
  styleUrls: ['./manage-auction.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAuctionComponent implements OnInit {
  auctions: Auction[] = [];
  selectedAuction: Auction | null = null;

  constructor(private auctionService: AuctionService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.fetchAuctions();
  }

  fetchAuctions() {
    this.auctionService.getAllAuctions().subscribe({
      next: data => this.auctions = data,
      error: err => console.error('Error fetching auctions', err)
    });
  }

  @ViewChild('viewAuctionModal') viewAuctionModal: TemplateRef<any> | undefined;
  @ViewChild('editAuctionModal') editAuctionModal: TemplateRef<any> | undefined;
  @ViewChild('deleteAuctionModal') deleteAuctionModal: TemplateRef<any> | undefined;

  openViewModal(auction: Auction) {
    this.selectedAuction = auction;
    this.modalService.open(this.viewAuctionModal, { centered: true });
  }
  
  openEditModal(auction: Auction) {
    this.selectedAuction = auction;
    this.modalService.open(this.editAuctionModal, { centered: true });
  }
  
  openDeleteModal(auction: Auction) {
    this.selectedAuction = auction;
    this.modalService.open(this.deleteAuctionModal, { centered: true });
  }

  deleteAuctionConfirmed() {
    if (!this.selectedAuction) return;

    this.auctionService.deleteAuction(this.selectedAuction.auctionId).subscribe({
      next: () => {
        this.auctions = this.auctions.filter(a => a.auctionId !== this.selectedAuction?.auctionId);
        this.selectedAuction = null;
      },
      error: err => {
        console.error('Error deleting auction', err);
        alert('Failed to delete auction.');
      }
    });
  }
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
  
    if (modalElement) {
      const modalInstance = (window as any).bootstrap?.Modal.getInstance(modalElement) 
        || new (window as any).bootstrap.Modal(modalElement);
  
      modalInstance?.hide();
  
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
  
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(el => el.remove());
    }
  }
  

  getStatusName(statusId: number | undefined): string {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'Active';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}
