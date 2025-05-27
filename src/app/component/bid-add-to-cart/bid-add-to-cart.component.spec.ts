import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidAddToCartComponent } from './bid-add-to-cart.component';

describe('BidAddToCartComponent', () => {
  let component: BidAddToCartComponent;
  let fixture: ComponentFixture<BidAddToCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidAddToCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidAddToCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
