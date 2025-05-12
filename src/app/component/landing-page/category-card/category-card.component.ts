import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetCategory } from '../../../modals/assetcategories';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; // Import HttpClient to call APIs
import { environment } from '../../../constants/enviroments';
import { ApiEndpoints } from '../../../constants/api-endpoints';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css'
})
export class CategoryCardComponent {


  categories: AssetCategory[] = []; // Array to hold categories

  constructor(private http: HttpClient) {}
ngOnInit(): void {
    // Replace with your actual API URL
    const apiUrl = environment.apiUrl;
    console.log(apiUrl);
    
  this.http.get<AssetCategory[]>(ApiEndpoints.ASSETCATEGORIES).subscribe(
      (data) => {
        this.categories = data; // Assuming the API returns an array of categories
        console.log(this.categories);
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }


   onCardClick(categoryId: number): void {
    console.log('Category ID:', categoryId);
    // You can call another API here based on the categoryId if needed
  }

  
// onImageError(event: Event) {
//   const target = event.target as HTMLImageElement;
//   target.src = 'assets/images/Screenshot28.png';
// }

  // @Input() icon!: string;
  // @Input() title!: string;
  // @Input() description!: string;

  
  // categories = [
  //   { name: 'Real Estate', icon: 'fas fa-home', description: 'Buy or sell property' },
  //   { name: 'Vehicles', icon: 'fas fa-car', description: 'Cars, bikes & more' },
  //   { name: 'Electronics', icon: 'fas fa-tv', description: 'TVs, phones, gadgets' },
  //   { name: 'Fashion', icon: 'fas fa-tshirt', description: 'Clothing & accessories' },
  //   { name: 'Jobs', icon: 'fas fa-briefcase', description: 'Find or post jobs' },
  //   { name: 'Services', icon: 'fas fa-tools', description: 'Local services' },
  //   { name: 'Furniture', icon: 'fas fa-couch', description: 'Home & office furniture' },
  //   { name: 'Books', icon: 'fas fa-book', description: 'New and used books' },
  //   { name: 'Pets', icon: 'fas fa-paw', description: 'Adopt or sell pets' },
  //   { name: 'Sports', icon: 'fas fa-football-ball', description: 'Gear & equipment' },
  //   { name: 'Toys', icon: 'fas fa-puzzle-piece', description: 'Fun for all ages' },
  //   { name: 'Beauty', icon: 'fas fa-spa', description: 'Products & services' },
  //   { name: 'Music', icon: 'fas fa-music', description: 'Instruments & audio' },
  //   { name: 'Travel', icon: 'fas fa-plane', description: 'Tours & tickets' }
  // ];
}
