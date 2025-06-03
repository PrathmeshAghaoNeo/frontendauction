import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-success',
  template: `<p>Payment successful! Creating order...</p>`,
})
export class PaymentSuccessComponent implements OnInit {
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private listservice: ListService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();
    const sessionId = localStorage.getItem('paymentId');
    console.log('userid here:' + typeof this.userId);

    if (sessionId && this.userId !== null) {
      const payload = {
        sessionId: sessionId,
        userId: this.userId,
      };
      localStorage.removeItem('paymentId');
      this.listservice.confirmPayment(payload).subscribe({
        next: () => {
          this.toastr.success('Order created successfully!');
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('Order creation failed:', err);
          this.toastr.error('Failed to create order after payment.');
        },
      });
    } else {
      this.toastr.warning('Invalid payment confirmation data.');
    }
  }
}
