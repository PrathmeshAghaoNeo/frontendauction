import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UdpateAssetcategoriesComponent } from './udpate-assetcategories.component';

describe('UdpateAssetcategoriesComponent', () => {
  let component: UdpateAssetcategoriesComponent;
  let fixture: ComponentFixture<UdpateAssetcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UdpateAssetcategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UdpateAssetcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
