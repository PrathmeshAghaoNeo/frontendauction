import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-refund-request',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './refund-request.component.html',
  styleUrl: './refund-request.component.css'
})
export class RefundRequestComponent {
  refundDetails = {
    amount: 'BHD 20.000',
    submissionDate: '18/09/2022 01:04 PM',
    status: 'Pending Approval',
    reference: 'C1879852'
  };
}
