import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { Asset } from '../../modals/manage-asset';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { environment } from "../../constants/enviroments";

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 

@Component({
  selector: 'app-manage-asset',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './manage-asset.component.html',
  styleUrls: ['./manage-asset.component.css']
})
export class ManageAssetComponent implements OnInit {
  assets: Asset[] = [];
  originalAssets: Asset[] = [];
  searchText: string = '';
  selectedAsset: Asset | null = null;
  page: number = 1;
  itemsPerPage: number = 5;
  environment = environment;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  @ViewChild('viewAssetModal') viewAssetModal!: TemplateRef<any>;

  constructor(
    private assetService: ManageAssetService,
    private router: Router,
    private location: Location,
    private modalService: NgbModal 
  ) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  statusOptions = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Published' },
    { id: 3, name: 'Auctioned' },
    { id: 4, name: 'Archived' },
    { id: 5, name: 'Pending' },
    { id: 6, name: 'Approved' },
    { id: 7, name: 'Payment' },
    { id: 8, name: 'Registration' },
    { id: 9, name: 'Transferred' },
    { id: 10, name: 'Closed' }
  ];

  statuses = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Closed' },
    { statusId: 4, statusName: 'Completed' }
  ];

  loadAssets(): void {
    this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      this.originalAssets = [...data];
      console.log('Assets:', this.assets);
    });
  }

  openViewAssetModal(asset: Asset): void {
    this.selectedAsset = asset;
    this.modalService.open(this.viewAssetModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static'
    });
  }

  viewAsset(assetId: number): void {
    this.assetService.getAssetById(assetId).subscribe(
      (data) => {
        this.selectedAsset = data;
        console.log('Selected Asset:', this.selectedAsset);
      },
      (error) => {
        console.error('Error fetching asset details:', error);
      }
    );
  }

  newAssestRoute(): void {
    this.router.navigate(['/newAsset']);
  }

  EditAssestRoute(assetId: number): void {
    if (assetId && !isNaN(assetId)) {
      this.router.navigate(['/update-asset', assetId]);
    } else {
      Swal.fire('Error', 'Invalid asset ID', 'error');
    }
  }

  onSearchChange(): void {
    if (!this.searchText.trim()) {
      this.assets = [...this.originalAssets];
      return;
    }

    this.assets = this.originalAssets.filter(asset =>
      asset.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  sortAssets(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    if (this.sortDirection === '') {
      this.assets = [...this.originalAssets];
      this.onSearchChange();
      return;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.assets.sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];

      if (column.toLowerCase().includes('date')) {
        return (new Date(valA).getTime() - new Date(valB).getTime()) * dir;
      }

      const strA = valA?.toString().toLowerCase();
      const strB = valB?.toString().toLowerCase();

      return strA.localeCompare(strB) * dir;
    });
  }

  getAuctionStatus(auctionStatusId: number): string {
    return this.statuses.find(s => s.statusId === auctionStatusId)?.statusName || 'Unknown';
  }

  deleteAsset(asset: Asset): void {
    Swal.fire({
      title: `Delete "${asset.title}"?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.assetService.deleteAsset(asset.assetId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Asset has been deleted.', 'success');
            this.loadAssets();
          },
          error: (err) => {
            console.error('Error deleting asset', err);
            Swal.fire('Error!', 'Failed to delete asset.', 'error');
          }
        });
      }
    });
  }

  exportToExcel(): void {
    const exportData = this.assets.map(asset => ({
      'Asset ID': asset.assetId,
      'Title': asset.title,
      'Category': asset.categoryName || '-',
      'Starting Price': asset.startingPrice,
      'Status': asset.statusName || '-',
      'Created At': asset.createdAt ? new Date(asset.createdAt).toLocaleString() : 'N/A',
      'Updated At': asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : 'N/A',
      'Asset Number': asset.assetNumber,
      'Winner Name': asset.winnerName || '-',
      'Awarded Price': asset.awardedPrice || '-',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Assets': worksheet },
      SheetNames: ['Assets']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'Assets.xlsx');
  }
}
