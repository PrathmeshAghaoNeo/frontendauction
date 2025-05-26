import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { utc } from 'moment';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbModalModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.css'],
})
export class ReportsListComponent implements OnInit{
  @ViewChild('viewReportModal') viewReportModal!: TemplateRef<any>;
  searchTerm: string = '';
  pageSize = 7;
  currentPage = 1;
  selectedReport: string | null = null;
  defaultAuctions: Auction[] = [];
  expiredAuctions: Auction[] = [];
  upcomingAuctions: Auction[] = [];
  ongoingAuctions: Auction[] = [];
  activeDirectSaleAssets: Asset[] = [];
  assetsdata :Asset[] = [];

  

  

  reports = [
    'Revenue Generated via Auctions – Bar chart (Duration filter)',
    'Revenue Generated via Direct Sales – Bar chart (Duration filter)',
    'Total Auctions – Count and List',
    'Past Auctions – Count and List',
    'Current Ongoing Auctions – Count and List',
    'Upcoming Auctions – Count and List',
    'Active Direct Sale Listings – Count and List',
    'Pending Complete Registration – Count and List',
    'Pending Sale Approval – Count and List',
    'Latest Deposits – Count and List',
    'Refund Requests – Count and List',
    'High Bidding Limit Customers – Count and List',
    'Supplier Auctions – Count and List',
    'Statement of Account – Count and List',
  ];

  constructor(
    private modalService: NgbModal,
    private auctionService: AuctionService,
    private assetService:ManageAssetService,
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.fetchAuctions();
    this.fetchAssets();
  }

  get filteredReports() {
    return this.reports.filter((report) =>
      report.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedReports() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReports.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredReports.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  openViewModal(report: any): void {
    this.selectedReport = report;
    this.modalService.open(this.viewReportModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  

  fetchAuctions(): void {
    console.log("Calling fetchAuctions");
    this.auctionService.getAllAuctions().subscribe({
      next: (data) => {
        this.defaultAuctions = data;
        this.categorizeAuctions();
        
      },
      error: (err) => {
        console.error('Failed to load auctions', err);
      },
    });
  }

  fetchAssets(): void {
  console.log("Calling fetchAssets");
  this.assetService.getAssets().subscribe({
    next: (data) => {
      const now = new Date(); // current time in local (or UTC if your dates are in UTC)
      this.assetsdata = data;
      console.log("All data loaded",this.assetsdata);
      this.categorizeAssets();
    },
    error: (err) => {
      console.error('Failed to Load Assets from Direct Sale', err);
    }
  });
}
  categorizeAssets():void{
    console.log(this.activeDirectSaleAssets);
    
    this.activeDirectSaleAssets = this.assetsdata.filter(
      ast => ast.isAvailableForDirectSale==true && ast.isDeleted==false
    );
    console.log(this.activeDirectSaleAssets); 
  }


  categorizeAuctions(): void {
    const now = new Date;

    this.expiredAuctions = this.defaultAuctions.filter(
      (auction) => new Date(auction.endDateTime).getTime() < now.getTime()
    );
    

    this.upcomingAuctions = this.defaultAuctions.filter(
      (auction) => new Date(auction.startDateTime).getTime() > now.getTime()
    );
    

    this.ongoingAuctions = this.defaultAuctions.filter(
      (auction) =>
        new Date(auction.startDateTime).getTime() <= now.getTime() &&
        new Date(auction.endDateTime).getTime() >= now.getTime()
    );
    
  }
  
}
