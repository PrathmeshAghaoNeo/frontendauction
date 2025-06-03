import { Component } from '@angular/core';
import { GetOrdersComponentComponent } from "../../get-orders-component/get-orders-component.component";

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [GetOrdersComponentComponent],
  templateUrl: './my-purchases.component.html',
  styleUrl: './my-purchases.component.css'
})
export class MyPurchasesComponent {

}
