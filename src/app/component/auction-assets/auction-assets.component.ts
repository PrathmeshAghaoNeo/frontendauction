import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auction-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-assets.component.html',
  styleUrl: './auction-assets.component.css'
})
export class AuctionAssetsComponent implements OnInit {
  assets: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));

    if (!isNaN(categoryId)) {
      const url = `https://localhost:62627/api/Assets/auctionasset?categoryId=${categoryId}`;
      this.http.get<any[]>(url).subscribe({
        next: (data) => this.assets = data,
        error: (err) => console.error('Error fetching auction assets:', err)
      });
    } else {
      console.error('Invalid category ID');
    }
  }
}
