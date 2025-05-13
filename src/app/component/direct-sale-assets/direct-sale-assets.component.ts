import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-direct-sale-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-sale-assets.component.html',
  styleUrl: './direct-sale-assets.component.css'
})
export class DirectSaleAssetsComponent implements OnInit {
  assets: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    
    if (!isNaN(categoryId)) {
      const url = `https://localhost:62627/api/Assets/directsaleasset?categoryId=${categoryId}`;
      this.http.get<any[]>(url).subscribe({
        next: (data) => this.assets = data,
        error: (err) => console.error('Error fetching assets:', err)
      });
    } else {
      console.error('Invalid category ID');
    }
  }
}
