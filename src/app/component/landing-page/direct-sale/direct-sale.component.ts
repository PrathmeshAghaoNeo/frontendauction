import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetCategory, CategoryTranslation } from '../../../modals/assetcategories';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../constants/enviroments';
import { ApiEndpoints } from '../../../constants/api-endpoints';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { AssetCategoriesService } from '../../../services/assetcategories.service';
import { forkJoin } from 'rxjs';

@Component({
   selector: 'app-direct-sale',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './direct-sale.component.html',
  styleUrl: './direct-sale.component.css',

})
export class DirectSaleComponentLP implements OnInit {

  categories: AssetCategory[] = [];
  selectedAssetCategory: AssetCategory | null = null;
  assetBaseUrl: string = `${environment.imgUrl}`;

  constructor(private http: HttpClient,private router:Router,private assetcategoriesService : AssetCategoriesService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

 fetchCategories(): void {
  const langCode = 'ar'; 

  forkJoin([
    this.http.get<AssetCategory[]>(ApiEndpoints.ASSETCATEGORIES),
    this.assetcategoriesService.fetchCategoryTranslations(langCode)
  ]).subscribe({
    next: ([categories, translations]: [AssetCategory[], CategoryTranslation[]]) => {
      console.log('Translations:', translations);

      const translationsMap = new Map<number, string>();
      translations.forEach(t => translationsMap.set(Number(t.categoryId), t.translatedName));

      this.categories = categories.map(cat => {
        const translatedName = translationsMap.get(Number(cat.categoryId)) ?? null;
        return {
          ...cat,
          categoryName: translatedName ?? cat.categoryName,
          translatedName
        };
      });

      console.log('Fetched Categories with Translations:', this.categories);
    },
    error: (err) => {
      console.error('Error fetching categories or translations', err);
    }
  });
}


  onCardClick(categoryId: number): void {
    console.log('Category ID from direct:', categoryId);
    this.router.navigate(['/direct-sale-assets', categoryId]);

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
