import { Component, Input, OnInit } from '@angular/core';
import { AssetCategoriesService } from '../../services/assetcategories.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AssetCategory } from '../../modals/assetcategories';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.css'],
})
export class CategorySelectorComponent implements OnInit {
  categories: AssetCategory[] = [];
  @Input() activeCategoryId?: number;
  @Input() routePrefix: string = ''; // 'auction-assets' or 'direct-sale-assets'
  currentSection: string = '';

  constructor(
    private categoryService: AssetCategoriesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
  console.log('🟡 ngOnInit called');

  this.loadCategories();
  this.getCategoryIdFromRoute(); // initial load

  this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      console.log('🔁 NavigationEnd detected, checking params again...');
      this.getCategoryIdFromRoute(); // update on route change
    });
}



 private getCategoryIdFromRoute(): void {
  let child = this.route;

  // Traverse down to the last child where 'id' param actually exists
  while (child.firstChild) {
    child = child.firstChild;
  }

  child.paramMap.subscribe((params) => {
    const id = params.get('id');
    if (id !== null) {
      this.activeCategoryId = +id;
      console.log('📌 Active category ID from route:', this.activeCategoryId);
    } else {
      console.warn('⚠️ No category ID found in route');
    }
  });
}



  loadCategories(): void {
    // console.log('📥 Fetching categories from service...');
    this.categoryService.getAll().subscribe((data) => {
      this.categories = data;
      // console.log('✅ Categories loaded:', this.categories);
    });
  }

  isActive(categoryId: number): boolean {
    const isActive = this.activeCategoryId === categoryId;
    // console.log(`🔍 Checking isActive for category ${categoryId}:`, isActive);
    return isActive;
  }


navigateToCategory(categoryId: number): void {
  if (this.routePrefix) {
    console.log(`Navigating to /${this.routePrefix}/${categoryId}`);
    this.router.navigate([`/${this.routePrefix}`, categoryId]);
    
  } else {
    console.warn('❌ routePrefix is not set!');
  }
}

}
