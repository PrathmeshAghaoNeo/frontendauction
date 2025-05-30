import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-success',
  template: `<p>Payment successful! Creating order...</p>`
})
export class PaymentSuccessComponent implements OnInit {
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private listservice: ListService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();
    const sessionId = localStorage.getItem("paymentId");
    console.log("userid here:"+typeof(this.userId));
    
    
    if (sessionId && this.userId !== null) {
        const payload = {
            sessionId: sessionId,
            userId: this.userId,
        };
        console.log("sessionid here :"+typeof(sessionId));
        console.log("userid here:"+this.userId);

      console.log("payload is here:"+payload);
      console.log({"payload is here": payload});
      
      
      this.listservice.confirmPayment(payload).subscribe({
        next: () => {
          alert('Order created successfully!');
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('Order creation failed:', err);
          alert('Failed to create order after payment.');
        }
      });
    } else {
      alert('Invalid payment confirmation data.');
    }
  }
}
