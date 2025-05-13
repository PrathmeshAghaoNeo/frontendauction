import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PromotionsComponent } from '../landing-page/promotions/promotions.component';
import { CategoryCardComponent } from '../landing-page/category-card/category-card.component';
import { DirectSaleComponent } from '../landing-page/direct-sale/direct-sale.component';

@Component({
  selector: 'app-reg-user-landing-page',
  standalone: true,
  imports: [RouterModule, PromotionsComponent, DirectSaleComponent,CategoryCardComponent ],
  templateUrl: './reg-user-landing-page.component.html',
  styleUrl: './reg-user-landing-page.component.css'
})
export class RegUserLandingPageComponent {

}
