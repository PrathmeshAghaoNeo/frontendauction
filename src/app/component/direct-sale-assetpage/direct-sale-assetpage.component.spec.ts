import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectSaleAssetpageComponent } from './direct-sale-assetpage.component';

describe('DirectSaleAssetpageComponent', () => {
  let component: DirectSaleAssetpageComponent;
  let fixture: ComponentFixture<DirectSaleAssetpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectSaleAssetpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectSaleAssetpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


