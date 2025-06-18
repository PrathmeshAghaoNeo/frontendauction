import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset } from '../../../modals/manage-asset';



@Component({
  selector: 'app-featured-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-assets.component.html',
  styleUrls: ['./featured-assets.component.css'],
})
export class FeaturedAssetsComponent {
  featuredAssets = [
    {
      name: 'Antique Sword',
      description: 'A 17th-century ornamental sword.',
      imageUrl: 'https://via.placeholder.com/600x400?text=Sword',
    },
    {
      name: 'Vintage Camera',
      description: 'Classic film camera from 1940s.',
      imageUrl: 'https://via.placeholder.com/600x400?text=Camera',
    },
    {
      name: 'Oil Painting',
      description: 'Signed artwork from a 19th-century artist.',
      imageUrl: 'https://via.placeholder.com/600x400?text=Painting',
    },
  ];

  featured: Asset[] = [];
  constructor() {
    // private assetService: AssetService,
  }
  customOptions: any = {
    loop: true,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
    navText: ['‹', '›'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 },
    },
  };

  ngOnInit(): void {
    console.log('Featured assets loaded', this.featuredAssets);
  }
}
