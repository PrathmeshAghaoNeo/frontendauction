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
import { ReportsService } from '../../services/reports.service';
import { User } from '../../modals/user';
import { Transaction } from '../../modals/manage-transaction';
import { AuctionReport, HighBiddingCustomer, RequestTransaction, StatementOfAccountResponse } from '../../modals/reports';

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
  itemsPerPage = 6;
  currentPage: number = 1;
  selectedReport: string | null = null;

  defaultAuctions: AuctionReport[] = [];
  expiredAuctions: AuctionReport[] = [];
  upcomingAuctions: AuctionReport[] = [];
  ongoingAuctions: AuctionReport[] = [];
  activeDirectSaleAssets: Asset[] = [];
  assetsdata: Asset[] = [];

  auctionRevenue: any[] = []; // Auction revenue for bar chart
  directSalesRevenue: any[] = []; // Direct Sales revenue for bar chart
  pendingRegistrations: User[] = [];
  pendingSales: Asset[] = [];
  latestDeposits: RequestTransaction[] = [];
  refundRequests: RequestTransaction[] = [];
  highBidders: HighBiddingCustomer[] = [];
  supplierAuctions: User[] = [];
  accountStatements: StatementOfAccountResponse[] = [];

  auctionRevenueRaw: any[] = [];
  directSalesRevenueRaw: any[] = [];

  reports = [
    'Revenue Generated via Auctions – Bar chart (Duration filter)',
    'Revenue Generated via Direct Sales – Bar chart (Duration filter)',
    'Total Auctions – Count and List',
    'Past Auctions – Count and List',
    'Current Ongoing Auctions – Count and List',
    'Upcoming Auctions – Count and List',
    'Active Direct Sale Listings – Count and List',
    // 'Pending Complete Registration – Count and List',
    // 'Pending Sale Approval – Count and List',
    'Latest Deposits – Count and List',
    'Refund Requests – Count and List',
    'High Bidding Limit Customers – Count and List',
    // 'Supplier Auctions – Count and List',
    'Statement of Account – Count and List',
  ];

  constructor(
    private modalService: NgbModal,
    private auctionService: AuctionService,
    private assetService: ManageAssetService,
    private reportsService: ReportsService
  ) {}

   ngOnInit(): void {
    this.loadAllData();
  }

  get filteredReports() {
    return this.reports.filter((report) =>
      report.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  loadAllData(): void {
    this.loadAuctions();
    this.fetchAssets();
    this.fetchAuctionRevenue();
    this.fetchDirectSalesRevenue();
    this.fetchActiveDirectSales();
    this.fetchRefundRequests();
    this.fetchLatestDeposits();
    this.fetchHighBidders();
    this.fetchAccountStatements();
  }

  openViewModal(report: string): void {
    this.selectedReport = report;

    switch (report) {
      case 'Revenue Generated via Auctions – Bar chart (Duration filter)':
        this.fetchAuctionRevenue();
        break;
      case 'Revenue Generated via Direct Sales – Bar chart (Duration filter)':
        this.fetchDirectSalesRevenue();
        break;
      case 'Active Direct Sale Listings – Count and List':
        this.fetchActiveDirectSales();
        break;
      case 'Refund Requests – Count and List':
        this.fetchRefundRequests();
        break;
      case 'Latest Deposits – Count and List':
        this.fetchLatestDeposits();
        break;
      case 'High Bidding Limit Customers – Count and List':
        this.fetchHighBidders();
        break;
      case 'Statement of Account – Count and List':
        this.fetchAccountStatements();
        break;
    }

    this.modalService.open(this.viewReportModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  // fetchAuctions(): void {
  //   this.reports.().subscribe({
  //     next: (auctions: AuctionReport[]) => {
  //       this.defaultAuctions = auctions;
  //       this.categorizeAuctions();
  //     },
  //     error: (err) => {
  //       console.error('Failed to fetch auctions:', err);
  //       this.defaultAuctions = [];
  //       this.expiredAuctions = [];
  //       this.upcomingAuctions = [];
  //       this.ongoingAuctions = [];
  //     },
  //   });
  // }

  loadAuctions(): void {
  const reportMappings = [
    { type: 'Total', key: 'defaultAuctions' },
    { type: 'Past', key: 'expiredAuctions' },
    { type: 'Upcoming', key: 'upcomingAuctions' },
    { type: 'Current', key: 'ongoingAuctions' }
  ];

  reportMappings.forEach((mapping) => {
    this.reportsService.getAuctionsReport(mapping.type).subscribe({
      next: (response) => {
        if (Array.isArray(response.auctions)) {
          (this as any)[mapping.key] = response.auctions;
        } else {
          console.warn(`Invalid response for ${mapping.type} auctions`, response);
          (this as any)[mapping.key] = [];
        }
      },
      error: (error) => {
        console.error(`Failed to load ${mapping.type} auctions:`, error);
        (this as any)[mapping.key] = [];
      }
    });
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

  fetchAuctionRevenue(): void {
    this.reportsService.getMonthlyAuctionRevenue().subscribe({
      next: (data) => {
        this.auctionRevenueRaw = data;
        this.auctionRevenue = this.transformRevenueData(this.auctionRevenueRaw);
      },
      error: (err) => {
        console.error('Failed to fetch auction revenue', err);
      },
    });
  }

  fetchDirectSalesRevenue(): void {
    this.reportsService.getMonthlyDirectSaleRevenue().subscribe({
      next: (data) => {
        this.directSalesRevenueRaw = data;
        this.directSalesRevenue = this.transformRevenueData(
          this.directSalesRevenueRaw
        );
      },
      error: (err) => {
        console.error('Failed to fetch direct sale revenue', err);
      },
    });
  }

  private transformRevenueData(data: any[]): any[] {
    return data.map((item) => {
      const monthName = new Date(item.year, item.month - 1).toLocaleString(
        'default',
        { month: 'short' }
      );
      return {
        name: `${monthName} ${item.year}`,
        value: item.totalAmount,
      };
    });
  }

  fetchActiveDirectSales(): void {
    this.reportsService.getDirectSaleAssets().subscribe({
      next: (data) => {
        this.activeDirectSaleAssets = data;
      },
      error: (err) => {
        console.error('Failed to fetch active direct sale listings', err);
      },
    });
  }

  fetchRefundRequests(): void {
    this.reportsService.getRefundRequests().subscribe({
      next: (data) => {
        this.refundRequests = data.transactions; // Extract the transactions array
        console.log('Refund Requests:', this.refundRequests);
      },
      error: (err) => {
        console.error('Failed to fetch refund requests', err);
      },
    });
  }

  fetchLatestDeposits(): void {
    this.reportsService.getLatestDepositRequests().subscribe({
      next: (data) => {
        this.latestDeposits = data.transactions; // extract the array
        console.log('fetch latest deposit');
        console.log('Transactions:', this.latestDeposits);
        console.log('Count:', data.depositTransactionCount);
      },
      error: (err) => {
        console.error('Failed to fetch latest deposits', err);
      },
    });
  }

  fetchHighBidders(): void {
    this.reportsService.getHighBiddingCustomers().subscribe({
      next: (data) => {
        this.highBidders = data;
      },
      error: (err) => {
        console.error('Failed to fetch high bidding customers', err);
      },
    });
  }

  fetchAccountStatements(): void {
  // this.isLoadingStatements = true; // Optional loading indicator
  this.reportsService.getAccountStatement().subscribe({
    next: (response) => {
      if (response && Array.isArray(response.transactions)) {
        this.accountStatements = response.transactions;
        console.log('✅ Account statements fetched:', this.accountStatements);
      } else {
        console.warn('⚠️ Unexpected account statement response format', response);
        this.accountStatements = [];
      }
    },
    error: (err) => {
      console.error('❌ Failed to fetch account statements:', err);
      this.accountStatements = [];
    }
    // complete: () => {
    //   this.isLoadingStatements = false; // Optional loading indicator reset
    // }
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
          Status: a.statusId,
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

      case 'Active Direct Sale Listings – Count and List':
        data = this.activeDirectSaleAssets.map((a, index) => ({
          '#': index + 1,
          Name: a.title,
          Price: a.startingPrice,
          Category: a.categoryName,
        }));
        break;

      case 'Pending Complete Registration – Count and List':
        data = this.pendingRegistrations.map((u: any, index) => ({
          '#': index + 1,
          Name: u.name,
          Email: u.email,
          Phone: u.phone,
        }));
        break;

      case 'Pending Sale Approval – Count and List':
        data = this.pendingSales.map((s: any, index) => ({
          '#': index + 1,
          Title: s.title,
          SubmittedBy: s.supplierName,
          Status: s.status,
        }));
        break;

      case 'Latest Deposits – Count and List':
        data = this.latestDeposits.map((d: any, index) => ({
          '#': index + 1,
          Name: d.userName,
          Amount: d.amount,
          Date: this.formatDate(d.date),
        }));
        break;

      case 'Refund Requests – Count and List':
        data = this.refundRequests.map((r: any, index) => ({
          '#': index + 1,
          TransactionID: r.transactionNumber,
          Amount: r.amount,
          Status: r.status,
          Date: r.transactionDateTime,
        }));
        break;

      case 'High Bidding Limit Customers – Count and List':
        data = this.highBidders.map((b: any, index) => ({
          '#': index + 1,
          Name: b.name,
          Email: b.email,
          Limit: b.limit,
        }));
        break;

      case 'Supplier Auctions – Count and List':
        data = this.supplierAuctions.map((a: any, index) => ({
          '#': index + 1,
          Title: a.title,
          Supplier: a.supplierName,
          Status: a.status,
        }));
        break;

      case 'Statement of Account – Count and List':
        data = this.accountStatements.map((s: any, index) => ({
          '#': index + 1,
          Date: this.formatDate(s.date),
          Description: s.description,
          Amount: s.amount,
          Type: s.type,
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
