import {
  Component,
  NgModule,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Auction } from '../../modals/auctions';
import { AuctionService } from '../../services/auction.service';
import { Asset } from '../../modals/manage-asset';
import { ManageAssetService } from '../../services/asset.service';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgbModalModule,
    NgxPaginationModule,
    NgxChartsModule,
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.css'],
})
export class ReportsListComponent implements OnInit {
  @ViewChild('viewReportModal') viewReportModal!: TemplateRef<any>;

  searchTerm: string = '';
  page = 1;
  itemsPerPage = 7;
  currentPage: number = 1;
  selectedReport: string | null = null;

  defaultAuctions: Auction[] = [];
  expiredAuctions: Auction[] = [];
  upcomingAuctions: Auction[] = [];
  ongoingAuctions: Auction[] = [];
  activeDirectSaleAssets: Asset[] = [];
  assetsdata: Asset[] = [];

  auctionRevenue: any[] = []; // Auction revenue for bar chart
  directSalesRevenue: any[] = []; // Direct Sales revenue for bar chart

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
    private assetService: ManageAssetService
  ) {}

  ngOnInit(): void {
    this.fetchAuctions();
    this.fetchAssets();
  }

  get filteredReports() {
    return this.reports.filter((report) =>
      report.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openViewModal(report: string): void {
    this.selectedReport = report;

    if (
      report === 'Revenue Generated via Auctions – Bar chart (Duration filter)'
    ) {
      this.fetchAuctionRevenue();
    } else if (
      report ===
      'Revenue Generated via Direct Sales – Bar chart (Duration filter)'
    ) {
      // this.fetchDirectSalesRevenue();
    }

    this.modalService.open(this.viewReportModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  fetchAuctionRevenue(): void {
    this.auctionService.getRevenueGroupedByMonth().subscribe({
      next: (data) => {
        this.auctionRevenue = data;
        console.log('Auction revenue data:', this.auctionRevenue);
      },
      error: (err) => {
        console.error('Failed to load auction revenue', err);
      },
    });
  }

  // fetchDirectSalesRevenue(): void {
  //   this.assetService.getDirectSalesRevenueGroupedByMonth().subscribe({
  //     next: (data) => {
  //       this.directSalesRevenue = data;
  //       console.log('Direct Sales revenue data:', this.directSalesRevenue);
  //     },
  //     error: (err) => {
  //       console.error('Failed to load direct sales revenue', err);
  //     },
  //   });
  // }

  fetchAuctions(): void {
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
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assetsdata = data;
        this.categorizeAssets();
      },
      error: (err) => {
        console.error('Failed to Load Assets from Direct Sale', err);
      },
    });
  }

  categorizeAssets(): void {
    this.activeDirectSaleAssets = this.assetsdata.filter(
      (ast) => ast.isAvailableForDirectSale && !ast.isDeleted
    );
  }

  categorizeAuctions(): void {
    const now = new Date();

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

  downloadReport(reportName: string): void {
    let data: any[] = [];

    switch (reportName) {
      case 'Total Auctions – Count and List':
        data = this.defaultAuctions.map((a, index) => ({
          '#': index + 1,
          Title: a.title,
          Type: a.type,
          Status: a.statusName,
        }));
        break;

      case 'Past Auctions – Count and List':
        data = this.expiredAuctions.map((a, index) => ({
          '#': index + 1,
          Title: a.title,
          'Ended On': this.formatDate(a.endDateTime),
        }));
        break;

      case 'Upcoming Auctions – Count and List':
        data = this.upcomingAuctions.map((a, index) => ({
          '#': index + 1,
          Title: a.title,
          'Starts On': this.formatDate(a.startDateTime),
        }));
        break;

      case 'Current Ongoing Auctions – Count and List':
        data = this.ongoingAuctions.map((a, index) => ({
          '#': index + 1,
          Title: a.title,
          'Ends On': this.formatDate(a.endDateTime),
        }));
        break;

      default:
        alert('Download not available for this report.');
        return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${reportName}.xlsx`);
  }

  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
  }
}
