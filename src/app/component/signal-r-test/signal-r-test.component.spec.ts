import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalRTestComponent } from './signal-r-test.component';

describe('SignalRTestComponent', () => {
  let component: SignalRTestComponent;
  let fixture: ComponentFixture<SignalRTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalRTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalRTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
