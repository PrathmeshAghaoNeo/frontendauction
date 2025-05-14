import { Component, OnInit } from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { HttpClient } from '@angular/common/http';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-bid.component.html',
  styleUrl: './direct-bid.component.css'
})
export class DirectBidComponent implements OnInit{

  assets: Asset[] = [];
  originalAssets: Asset[] = [];

  constructor(private http: HttpClient , private assetService: ManageAssetService) {}

  ngOnInit() {
   this.assetService.getAssets().subscribe((data) => {
      this.assets = data;
      this.originalAssets = [...data]; // Assign random status ID

      console.log('Assets:', this.assets); // Debugging log to see fetched data
      }); 
  }

  getFlagUrl(asset: Asset): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }

 layoutType: 'grid' | 'row' = 'grid';

toggleLayout() {
  this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
}

}
