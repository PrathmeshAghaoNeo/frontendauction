import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetCategory } from '../../../modals/assetcategories';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../constants/enviroments';
import { ApiEndpoints } from '../../../constants/api-endpoints';
@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css',

})
export class CategoryCardComponent implements OnInit {

  categories: AssetCategory[] = [];
  selectedAssetCategory: AssetCategory | null = null;
  assetBaseUrl: string = `${environment.imgUrl}`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.http.get<AssetCategory[]>(ApiEndpoints.ASSETCATEGORIES).subscribe({
      next: (data) => {
        this.categories = data;
        console.log('Fetched Categories:', this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  onCardClick(categoryId: number): void {
    console.log('Category ID:', categoryId);
    // You can implement additional logic here
  }

  getFullIconUrl(icon: string | null | undefined): string {
    if (!icon) return 'assets/images/Screenshot28.png';
    if (icon.startsWith('http') || icon.startsWith('data:image')) {
      return icon;
    }
    return `${this.assetBaseUrl}${icon}`;
  }

  
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '';
  }

  
}
