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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Component({
  selector: 'app-manage-assetcategories',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './manage-assetcategories.component.html',
  styleUrls: ['./manage-assetcategories.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAssetCategoriesComponent implements OnInit {
  assetCategories: AssetCategory[] = [];
  selectedCategory: AssetCategory | null = null;
  selectedAssetCategory: AssetCategory | null = null;

  statuses = [
    { statusId: 1, statusName: 'Pending' },
    { statusId: 2, statusName: 'Active' },
    { statusId: 3, statusName: 'Closed' },
    { statusId: 4, statusName: 'Completed' }
  ];

  page: number = 1;
  itemsPerPage: number = 5;

  @ViewChild('viewAssetCategoryModal') viewAssetCategoryModal!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private assetCategoriesService: AssetCategoriesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchAssetCategories();
  }
  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  fetchAssetCategories(): void {
    this.assetCategoriesService.getAll().subscribe(
      (data) => {
        this.assetCategories = data;
      },
      (error) => {
        console.error('Error fetching asset categories:', error);
      }
    );
  }

  getStatusName(statusId: number | null | undefined): string {
    if (statusId === null || statusId === undefined) {
      return 'Unknown';
    }
    return this.statuses.find(s => s.statusId === statusId)?.statusName || 'Unknown';
  }

  getRowIndex(index: number): number {
    return (this.page - 1) * this.itemsPerPage + index + 1;
  }

  openViewModal(category: AssetCategory): void {
    if (!category.categoryId) return;
  
    this.assetCategoriesService.getById(category.categoryId).subscribe({
      next: (data) => {
        this.selectedAssetCategory = {
          ...data,
          IconFile: this.getFullIconUrl(data.IconFile ?? ''),
          statusName: this.getStatusName(data.statusId ?? 0)
        };
        this.modalService.open(this.viewAssetCategoryModal, {
          centered: true,
          windowClass: 'custom-wide-modal'
        });
      },
      error: (err) => {
        console.error('Error fetching category by ID:', err);
        Swal.fire('Error', 'Could not load category details.', 'error');
      }
    });
  }
  
  getFullIconUrl(icon: string | null | undefined): string {
    if (!icon) return '';
    if (icon.startsWith('http') || icon.startsWith('data:image')) {
      return icon; // already full path or base64
    }
    return `${ApiEndpoints.ASSETCATEGORIES}`; 
  }

  navigateToEdit(category: AssetCategory): void {
    this.router.navigate(['/update-asset-category', category.categoryId]);
  }

  openDeleteModal(category: AssetCategory): void {
    Swal.fire({
      title: 'Delete this Category?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.deleteCategoryConfirmed(category);
      }
    });
  }

  deleteCategoryConfirmed(category: AssetCategory): void {
    const categoryId = category.categoryId ?? 0;
    this.assetCategoriesService.delete(categoryId).subscribe(
      () => {
        this.assetCategories = this.assetCategories.filter(c => c.categoryId !== category.categoryId);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
      },
      (error) => {
        console.error('Error deleting category:', error);
        Swal.fire('Error!', 'There was an error deleting the category.', 'error');
      }
    );
  }

  sortCategories(order: string): void {
    if (order === 'asc') {
      this.assetCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } else if (order === 'desc') {
      this.assetCategories.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
    }
  }
}
