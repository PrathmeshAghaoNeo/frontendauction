import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotAdminEditComponent } from './chatbot-admin-edit.component';

describe('ChatbotAdminEditComponent', () => {
  let component: ChatbotAdminEditComponent;
  let fixture: ComponentFixture<ChatbotAdminEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotAdminEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotAdminEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
