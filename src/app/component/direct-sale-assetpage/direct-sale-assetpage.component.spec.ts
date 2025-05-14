import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectSaleComponent } from './direct-sale-assetpage.component';

describe('DirectSaleAssetpageComponent', () => {
  let component: DirectSaleComponent;
  let fixture: ComponentFixture<DirectSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectSaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


