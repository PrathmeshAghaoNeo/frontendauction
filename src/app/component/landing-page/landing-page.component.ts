import { Component } from '@angular/core';

import { PromotionsComponent } from './promotions/promotions.component';
import { CategoryCardComponent } from './category-card/category-card.component';
import { DirectSaleComponent } from './direct-sale/direct-sale.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    PromotionsComponent,
    DirectSaleComponent,
    CategoryCardComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {}
