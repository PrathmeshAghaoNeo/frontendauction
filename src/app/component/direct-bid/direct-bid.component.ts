import { Component, OnInit } from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { HttpClient } from '@angular/common/http';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
=======
import { environment } from '../../constants/enviroments';
import { ActivatedRoute } from '@angular/router';
import { ListService } from '../../services/list.service';
import Swal from 'sweetalert2';
import { DirectSaleAssetDto } from '../../modals/add-asset';
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb

@Component({
  selector: 'app-direct-bid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-bid.component.html',
  styleUrl: './direct-bid.component.css'
})
export class DirectBidComponent implements OnInit{

<<<<<<< HEAD
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
=======
  // assets: Asset[] = [];
  // originalAssets: Asset[] = [];

  // constructor(private http: HttpClient , private assetService: ManageAssetService) {}

  // ngOnInit() {
  //  this.assetService.getAssets().subscribe((data) => {
  //     this.assets = data;
  //     this.originalAssets = [...data]; // Assign random status ID

  //     console.log('Assets:', this.assets); // Debugging log to see fetched data
  //     }); 
  // }


   assets: DirectSaleAssetDto[] = [];
    originalAssets: DirectSaleAssetDto[] = [];
    layoutType: 'grid' | 'row' = 'grid';
    userId: number = 1;
    environment = environment;
    constructor(
      private route: ActivatedRoute,
      private assetService: ManageAssetService,
      private listService: ListService
    ) {}
  
    ngOnInit(): void {
      const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
      if (!isNaN(categoryId)) {
        this.assetService.getDirectAssets(categoryId).subscribe({
          next: (data) => {
            this.assets = data;
            this.originalAssets = [...data]; // Keep a copy for filtering/sortin
            console.log('Assets:', this.assets);
          },
  
          error: (err) => {
            console.log({ err });
            console.error('Error fetching assets:', err);
            Swal.fire('Error!', err.error.message);
          },
        });
      } else {
        // console.error('Invalid category ID');
        Swal.fire('Error!', 'Invalid category ID');
      }
    }
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb

  getFlagUrl(asset: Asset): string {
    return asset.galleries?.[0]?.fileUrl || 'assets/flags/bahrain.png';
  }

<<<<<<< HEAD
 layoutType: 'grid' | 'row' = 'grid';
=======
//  layoutType: 'grid' | 'row' = 'grid';
>>>>>>> 95ece7aed413107f8dbf8351ac690b01732c6dcb

toggleLayout() {
  this.layoutType = this.layoutType === 'grid' ? 'row' : 'grid';
}

}
