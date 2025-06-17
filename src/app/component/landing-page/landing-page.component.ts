import { Component } from '@angular/core';

import { PromotionsComponent } from './promotions/promotions.component';
import { CategoryCardComponent } from './category-card/category-card.component';
import { DirectSaleComponentLP } from './direct-sale/direct-sale.component';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { FeaturedAssetsComponent } from './featured-assets/featured-assets.component';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    PromotionsComponent,
    DirectSaleComponentLP,
    CategoryCardComponent,
    // FooterComponent,
    FeaturedAssetsComponent,
    // HeaderComponent
],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {}
