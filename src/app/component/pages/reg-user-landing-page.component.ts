import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PromotionsComponent } from '../landing-page/promotions/promotions.component';
import { CategoryCardComponent } from '../landing-page/category-card/category-card.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { DirectSaleComponentLP } from '../landing-page/direct-sale/direct-sale.component';

@Component({
  selector: 'app-reg-user-landing-page',
  standalone: true,
  imports: [RouterModule, PromotionsComponent, DirectSaleComponentLP,CategoryCardComponent ],
  templateUrl: './reg-user-landing-page.component.html',
  styleUrl: './reg-user-landing-page.component.css'
})
export class RegUserLandingPageComponent implements OnInit {

  username: string | null = null;
  userId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserIdJwt();

    if (this.userId !== null) {
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.username = user?.name || 'User'; // adjust property as needed
          
        },
        error: (err) => {
          console.error('Failed to fetch user:', err);
          this.username = 'User';
        }
      });
    }
  }
}

