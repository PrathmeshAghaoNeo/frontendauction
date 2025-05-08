import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAuctionComponent } from './update-auction.component';

describe('UpdateAuctionComponent', () => {
  let component: UpdateAuctionComponent;
  let fixture: ComponentFixture<UpdateAuctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAuctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
