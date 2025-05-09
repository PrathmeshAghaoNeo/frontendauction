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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../constants/enviroments';

@Component({
  selector: 'app-manage-assetcategories',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule,FormsModule],
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
  filterStatus: string = 'All';
  
  filteredCategories: any[] = []; 
  selectedCategory: AssetCategory | null = null;
  selectedAssetCategory: AssetCategory | null = null;

  statuses = [
    // { statusId: 0, statusName: 'All' }, 
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
    private sanitizer: DomSanitizer
  ) {}

  

ngOnInit(): void {
  this.fetchAssetCategories();
}


fetchAssetCategories(): void {
  this.assetCategoriesService.getAll().subscribe(
    (data) => {
      this.allAssetCategories = data;
      this.assetCategories = data.sort((a, b) => b.categoryId - a.categoryId);
      // this.applyFilters();
    },
    (error) => {
      console.error('Error fetching asset categories:', error);
    }
  );
}
applyFilters(): void {
  const search = this.searchText.trim().toLowerCase();
  const statusId = Number(this.filterStatus); 

  this.assetCategories = this.allAssetCategories.filter(category => {
    const matchesSearch = !search || category.categoryName.toLowerCase().includes(search);
    const matchesStatus = statusId === 0 || category.statusId === statusId;

    return matchesSearch && matchesStatus;
  });
}
assetBaseUrl: string = `${environment.imgUrl}`;

filterCategories(): void {
  const search = this.searchText.toLowerCase();
  this.assetCategories = this.allAssetCategories.filter((category) =>
    category.categoryName.toLowerCase().includes(search)
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
