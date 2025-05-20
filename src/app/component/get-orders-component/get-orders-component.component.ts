import { Component } from '@angular/core';
import { ListService } from '../../services/list.service';
import { CommonModule } from '@angular/common';
import { DirectSaleAssetDto } from '../../modals/manage-asset';

@Component({
  selector: 'app-get-orders-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-orders-component.component.html',
  styleUrl: './get-orders-component.component.css'
})
export class GetOrdersComponentComponent {
userId = 1; 
  orders: DirectSaleAssetDto[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private ordersService: ListService) {}

  ngOnInit(): void {
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
      }
    });
  }
}
