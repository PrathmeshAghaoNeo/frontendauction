import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayInTouchComponent } from './stay-in-touch.component';

describe('StayInTouchComponent', () => {
  let component: StayInTouchComponent;
  let fixture: ComponentFixture<StayInTouchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayInTouchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StayInTouchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
