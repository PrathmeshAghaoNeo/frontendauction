import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotAdminViewComponent } from './chatbot-admin-view.component';

describe('ChatbotAdminViewComponent', () => {
  let component: ChatbotAdminViewComponent;
  let fixture: ComponentFixture<ChatbotAdminViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotAdminViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotAdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
