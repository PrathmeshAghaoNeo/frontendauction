import {
  Component,
  OnInit,
  ViewEncapsulation,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { AssetCategory } from '../../modals/assetcategories';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { FormsModule } from '@angular/forms';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { environment } from '../../constants/enviroments';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-manage-assetcategories',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule, FormsModule],
  templateUrl: './manage-assetcategories.component.html',
  styleUrls: ['./manage-assetcategories.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAssetCategoriesComponent implements OnInit {
  assetCategories: AssetCategory[] = [];
  allAssetCategories: AssetCategory[] = [];
  searchText: string = '';
  page: number = 1;
  itemsPerPage: number = 5;
  filterStatus: number = 0;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  selectedAssetCategory: AssetCategory | null = null;

  statuses = [
    { statusId: 1, statusName: 'Draft' },
    { statusId: 2, statusName: 'Published' }
  ];
  paymentMethods = [
    { methodId: 1, methodName: 'Bank Transfer' },
    { methodId: 2, methodName: 'Debit Card' },
    { methodId: 3, methodName: 'Apply Pay' },
    { methodId: 4, methodName: 'Google Pay' },
    { methodId: 5, methodName: 'Cheque' },
  ];

  @ViewChild('viewAssetCategoryModal') viewAssetCategoryModal!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private assetCategoriesService: AssetCategoriesService,
  ) { }


  ngOnInit(): void {
    this.fetchAssetCategories();
  }

  getFullIconUrl(icon: string | null | undefined): string {
    if (!icon) return '';
    if (icon.startsWith('http') || icon.startsWith('data:image')) {
      return icon; // already full path or base64
    }
    return `${ApiEndpoints.ASSETCATEGORIES}`;
  }
  getVatTypeLabel(vatid: number | undefined): string {
    switch (vatid) {
      case 1: return 'Exclusive';
      case 2: return 'Inclusive';
      case 3: return 'Not Applicable';
      default: return 'N/A';
    }
  }
  assetBaseUrl: string = `${environment.baseurl}`;
  fetchAssetCategories(): void {
    this.assetCategoriesService.getAll().subscribe({
      next: (data) => {
        this.allAssetCategories = data;
        this.assetCategories = data.sort((a, b) => b.categoryId - a.categoryId);
      },
      error: (error) => {
        console.error('Error fetching asset categories:', error);
        Swal.fire('Error!', 'Failed to load asset categories.', 'error');
      }
    });
  }
  getRowIndex(index: number): number {
    return (this.page - 1) * this.itemsPerPage + index + 1;
  }
  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? '↑' : this.sortDirection === 'desc' ? '↓' : '⇅';
    } else {
      return '⇅';
    }
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    const status = Number(this.filterStatus);

    this.assetCategories = this.allAssetCategories.filter(category => {
      const matchesSearch = !search || category.categoryName.toLowerCase().includes(search);
      const matchesStatus = status === 0 || category.statusId === status;
      return matchesSearch && matchesStatus;
    });

    if (this.sortDirection !== '') {
      this.sortCategories(this.sortColumn);
    }
  }

  sortCategories(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    if (this.sortDirection === '') {
      this.assetCategories = [...this.allAssetCategories];
      this.applyFilters();
      return;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.assetCategories.sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];

      const strA = valA?.toString().toLowerCase();
      const strB = valB?.toString().toLowerCase();

      if (strA < strB) return -1 * dir;
      if (strA > strB) return 1 * dir;
      return 0;
    });
  }

  getStatusName(statusId: number | null | undefined): string {
    if (statusId === null || statusId === undefined) {
      return 'Unknown';
    }
    return this.statuses.find(s => s.statusId === statusId)?.statusName || 'Unknown';
  }

  openViewModal(category: AssetCategory): void {
    this.selectedAssetCategory = category;
    this.modalService.open(this.viewAssetCategoryModal, { centered: true, size: 'lg', backdrop: 'static' });
  }

  navigateToEdit(category: AssetCategory): void {
    this.router.navigate(['/update-assetcategory', category.categoryId]);
  }

  openDeleteModal(category: AssetCategory): void {
    this.selectedAssetCategory = category;

    Swal.fire({
      title: `Delete this Category?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCategoryConfirmed();
      }
    });
  }

  deleteCategoryConfirmed(): void {
    if (!this.selectedAssetCategory) {
      Swal.fire('Error', 'No category selected.', 'error');
      return;
    }

    this.assetCategoriesService.delete(this.selectedAssetCategory.categoryId).subscribe({
      next: () => {
        this.assetCategories = this.assetCategories.filter(c => c.categoryId !== this.selectedAssetCategory?.categoryId);
        this.selectedAssetCategory = null;
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
      },
      error: err => {
        console.error('Error deleting category', err);
        Swal.fire('Error!', 'Failed to delete category.', 'error');
      }
    });
  }
  exportToExcel(): void {
    const exportData = this.allAssetCategories.map(assetcateg => ({
      'Category Name': assetcateg.categoryName,
      'Sub Category': assetcateg.subcategory,
      'Deposit %': assetcateg.depositPercentage,
      'Details': assetcateg.details,
      'Status': assetcateg.statusName,
      'Admin Fees': assetcateg.adminFees,
      'Auction Fees': assetcateg.auctionFees,
      "Buyer's Commission": assetcateg.buyerCommission,
      'Registration Deadline': assetcateg.registrationDeadline,
      'VAT Applicable': assetcateg.vatid,
      'VAT %': assetcateg.vatpercentage,
      'Payment Methods': assetcateg.paymentMethodIds?.join(', ') || '-'
    }));


    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'AssetCategories': worksheet },
      SheetNames: ['AssetCategories']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'AssetCategories.xlsx');
  }
}
