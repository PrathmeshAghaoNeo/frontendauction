import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAssetCategoriesComponent } from './manage-assetcategories.component';


describe('ManageAssetcategoriesComponent', () => {
  let component: ManageAssetCategoriesComponent;
  let fixture: ComponentFixture<ManageAssetCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAssetCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAssetCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
