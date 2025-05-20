import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Asset, DirectSaleAssetDto } from '../../modals/manage-asset';
import { CommonModule } from '@angular/common';
import { ManageAssetService } from '../../services/asset.service';
import { ListService } from '../../services/list.service';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-bid-add-to-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-add-to-cart.component.html',
  styleUrl: './bid-add-to-cart.component.css',
})
export class BidAddToCartComponent implements AfterViewInit {
  @ViewChild('liveToast') liveToast!: ElementRef;
  toastInstance: any;

  cartAssets: DirectSaleAssetDto[] = [];
  userId: number = 1;

  constructor(
    private assetService: ManageAssetService,
    private listservice: ListService,
    private router: Router
  ) {}

  confirmModal: any;
  ngAfterViewInit() {
    this.toastInstance = new bootstrap.Toast(this.liveToast.nativeElement);
     this.confirmModal = new bootstrap.Modal(document.getElementById('confirmCheckoutModal')),{ backdrop: false };
  }


openCheckoutModal(): void {
  const modalElement = document.getElementById('confirmCheckoutModal');
  if (modalElement) {
    this.confirmModal = new bootstrap.Modal(modalElement, { backdrop: false });
    this.confirmModal.show();
  }
}


confirmCheckout(): void {
  const payload = {
    userId: this.userId,
    assetIds: this.cartAssets.map(a => a.assetId),
  };

  this.listservice.checkoutCart(payload).subscribe({
    next: () => {
      this.showToast('Checkout successful!', 'Success', 'success');
      this.cartAssets = []; 
      this.confirmModal.hide();
    },
    error: () => {
      this.showToast('Checkout failed.', 'Error', 'error');
      this.confirmModal.hide();
    }
  });
}

  showToast(
    message: string,
    header = 'Notification',
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    const toastEl = this.liveToast.nativeElement;

    toastEl.querySelector('.toast-header ').textContent = header;

    // Change toast body message
    toastEl.querySelector('.toast-body').textContent = message;

    // Change header bg color depending on type
    const headerEl = toastEl.querySelector('.toast-header');

    headerEl.classList.remove(
      'bg-success',
      'bg-danger',
      'bg-info',
      'text-white'
    );
    if (type === 'success') {
      headerEl.classList.add('bg-danger', 'text-white');
    } else if (type === 'error') {
      headerEl.classList.add('bg-danger', 'text-white');
    } else {
      headerEl.classList.add('bg-danger', 'text-white');
    }

    this.toastInstance.show();
  }

  ngOnInit() {
    this.listservice.getCart(this.userId).subscribe((data) => {
      this.cartAssets = data;
      console.log('Cart Assets:', this.cartAssets);
    });
  }

  getSubtotal(): number {
    return this.cartAssets.reduce((sum, asset) => sum + asset.price, 0);
  }

  removeFromCart(asset: DirectSaleAssetDto): void {
    const payload = {
      userId: this.userId,
      assetId: asset.assetId,
    };

    console.log('before remove', this.cartAssets);

    this.listservice.removeFromCart(payload).subscribe({
      next: () => {
        this.cartAssets = this.cartAssets.filter(
          (a) => a.assetId !== asset.assetId
        );
        console.log('after remove', this.cartAssets);

        // Show success toast
        this.showToast(
          `Removed "${asset.title}" from cart successfully!`,
          'Success',
          'success'
        );
      },
      error: (err) => {
        console.error('Error removing asset from cart:', err);

        // Show error toast
        this.showToast('Failed to remove asset from cart.', 'Error', 'error');
      },
    });
  }

  goBack() {
    window.history.back();
  }
}
