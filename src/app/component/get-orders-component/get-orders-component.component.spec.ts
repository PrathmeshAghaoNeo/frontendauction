import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetOrdersComponentComponent } from './get-orders-component.component';

describe('GetOrdersComponentComponent', () => {
  let component: GetOrdersComponentComponent;
  let fixture: ComponentFixture<GetOrdersComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetOrdersComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetOrdersComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
