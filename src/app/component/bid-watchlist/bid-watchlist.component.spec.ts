import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidWatchlistComponent } from './bid-watchlist.component';

describe('BidWatchlistComponent', () => {
  let component: BidWatchlistComponent;
  let fixture: ComponentFixture<BidWatchlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidWatchlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidWatchlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
