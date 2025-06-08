import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { ChatbotAdminFaq } from '../../modals/chatbot-admin';

@Component({
  selector: 'app-chatbot-admin-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chatbot-admin-edit.component.html',
  styleUrl: './chatbot-admin-edit.component.css'
})
export class ChatbotAdminEditComponent{
  
}
