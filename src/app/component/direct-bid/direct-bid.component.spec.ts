import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectBidComponent } from './direct-bid.component';

describe('DirectBidComponent', () => {
  let component: DirectBidComponent;
  let fixture: ComponentFixture<DirectBidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectBidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
