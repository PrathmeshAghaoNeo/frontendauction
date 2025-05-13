import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalrTestComponent } from './signalr-test.component';

describe('SignalrTestComponent', () => {
  let component: SignalrTestComponent;
  let fixture: ComponentFixture<SignalrTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalrTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalrTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
