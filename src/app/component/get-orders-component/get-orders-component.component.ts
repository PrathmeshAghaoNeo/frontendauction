import { Component, Input } from '@angular/core';
import { ListService } from '../../services/list.service';
import { CommonModule, Location } from '@angular/common';
import { DirectSaleAssetDto } from '../../modals/manage-asset';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-orders-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-orders-component.component.html',
  styleUrl: './get-orders-component.component.css',
})
export class GetOrdersComponentComponent {
  userId: number | null = null;
  orders: DirectSaleAssetDto[] = [];
  isLoading = false;
  errorMessage = '';
  @Input() showGoBackButton: boolean = true;

  constructor(
    private ordersService: ListService,
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();
    if (!this.userId) {
      this.errorMessage = 'User not authenticated.';
      console.error(this.errorMessage);
      return;
    }

    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading = true;
    this.ordersService.getCheckoutOrders(this.userId).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        console.log('Orders:', this.orders);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load orders.';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/reguserlandingpage']);
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/order-details/', orderId]);
  }
}
