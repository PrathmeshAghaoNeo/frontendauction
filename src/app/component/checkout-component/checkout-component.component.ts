import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Asset } from '../../modals/manage-asset';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageAssetService } from '../../services/asset.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../constants/enviroments';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';
import { loadStripe } from '@stripe/stripe-js';
import { UserService } from '../../services/user.service';
declare var bootstrap: any;

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './checkout-component.component.html',
  styleUrl: './checkout-component.component.css'
})
export class CheckoutComponentComponent implements OnInit , AfterViewInit  {
  
     @ViewChild('liveToast') liveToast!: ElementRef;
      toastInstance: any;

  assetId: number | null = null;
  asset: Asset | null = null;
  environment = environment;
  userId: number | null = null;
  email: string | null = null;
  amount: number = 10;
  sessionID: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private assetService: ManageAssetService,
    private router:Router,
     private listservice: ListService,
     private authService : AuthService,
     private userService: UserService,
  ) {}

  confirmModal: any;
  ngAfterViewInit() {
    this.toastInstance = new bootstrap.Toast(this.liveToast.nativeElement);
    (this.confirmModal = new bootstrap.Modal(
      document.getElementById('confirmCheckoutModal')
    )),
      { backdrop: false };
  }


   openCheckoutModal(): void {
    const modalElement = document.getElementById('confirmCheckoutModal');
    if (modalElement) {
      this.confirmModal = new bootstrap.Modal(modalElement, {
        backdrop: false,
      });
      this.confirmModal.show();
    }
  }


  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();

    if (!this.userId) {
      alert('User not logged in');
      return;
    }

     this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.email = user.email; // Store email for session creation
      },
      error: () => {
        this.showToast('Failed to fetch user details.', 'Error', 'error');
      },
    });
    this.assetId = Number(this.route.snapshot.paramMap.get('assetId'));
    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (asset) => {
          this.asset = asset;
          console.log("data is added",asset);
          
        },
        error: (err) => console.error('Failed to fetch asset:', err)
      });
    }
  }

  checkout() {
    alert('Proceeding to payment...');
    // Implement real checkout logic here
  }

   confirmCheckout(): void {
      if (this.userId === null) {
        this.showToast('User not logged in.', 'Error', 'error');
        return;
      }
  
      const payload = {
        userId: this.userId, 
        assetIds: this.asset ? [this.asset.assetId] : [],
        totalAmount: this.asset?.awardedPrice,
        email: this.email,
      };

      console.log("payload to stripe",payload);
      
  
      this.listservice.createStripeSession(payload).subscribe({
        next: async (response: { sessionId: string }) => {
          localStorage.setItem('paymentId', response.sessionId);
          const stripe = await loadStripe(
            'pk_test_51RRtikGY6ElyrgGUXgRRI22AYfGJLziO9q1H1xoPlBiG2PfQaFe4xspeDge5fvL2sUONWDvx9NgKiz2db79DX7Q300AGRBCUQk'
          ); // your publishable key
          await stripe?.redirectToCheckout({ sessionId: response.sessionId });
        },
        error: () => {
          this.showToast('Stripe session creation failed.', 'Error', 'error');
        },
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
   
    goBack(): void {
    this.router.navigate(['/']); // Or wherever you want the back arrow to go
  }
}
