import { Component, OnInit } from '@angular/core';
import { FaqService } from '../../services/faq.service';
import { ChatbotAdminFaq } from '../../modals/chatbot-admin';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  standalone: true,
  imports :[FormsModule,CommonModule,HttpClientModule,NgxPaginationModule],
  selector: 'app-chatbot-admin',
  templateUrl: './chatbot-admin.component.html',
  styleUrls: ['./chatbot-admin.component.css']
})
export class ChatbotAdminComponent implements OnInit {
  faqs: (ChatbotAdminFaq & { showAnswer?: boolean })[] = [];
  filteredFaqs: (ChatbotAdminFaq & { showAnswer?: boolean })[] = [];
  selectedFaq: ChatbotAdminFaq | null = null;
  newFaq: Partial<ChatbotAdminFaq> = {};
  formFaq: any = {}; // For form binding
  isEditing: boolean = false;
  error: string = '';
  viewFaqObj: ChatbotAdminFaq | null = null;
  searchTerm: string = '';
  pageSize: number = 5;
  currentPage: number = 1;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs() {
    this.faqService.getFaqs().subscribe({
      next: (data) => {
        this.faqs = data.map(faq => ({ ...faq, showAnswer: false }));
        this.onSearch();
        this.ensureValidPage();
      },
      error: (err) => this.error = 'Failed to load FAQs'
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredFaqs = [...this.faqs];
    } else {
      this.filteredFaqs = this.faqs.filter(faq =>
        (faq.question && faq.question.toLowerCase().includes(term)) ||
        (faq.answer && faq.answer.toLowerCase().includes(term)) ||
        (faq.category && faq.category.toLowerCase().includes(term)) ||
        (faq.tags && faq.tags.toLowerCase().includes(term))
      );
    }
    this.ensureValidPage();
  }

  ensureValidPage() {
    const totalPages = this.totalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages || 1;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  paginatedFaqs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFaqs.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.ensureValidPage();
  }

  totalPages() {
    return Math.ceil(this.filteredFaqs.length / this.pageSize) || 1;
  }

  totalPagesArray() {
    return Array(this.totalPages());
  }

  toggleView(faq: ChatbotAdminFaq & { showAnswer?: boolean }) {
    faq.showAnswer = !faq.showAnswer;
  }

  openViewModal(faq: ChatbotAdminFaq) {
    this.viewFaqObj = faq;
    this.showModal('viewModal');
  }

  closeViewModal() {
    this.viewFaqObj = null;
    this.hideModal('viewModal');
  }

  openAddModal() {
    this.isEditing = false;
    this.formFaq = {};
    this.showModal('faqModal');
  }

  openEditModal(faq: ChatbotAdminFaq) {
    this.isEditing = true;
    this.selectedFaq = { ...faq };
    this.formFaq = this.selectedFaq;
    this.showModal('faqModal');
  }

  closeModal() {
    this.isEditing = false;
    this.selectedFaq = null;
    this.formFaq = {};
    this.hideModal('faqModal');
  }

  saveFaq() {
    if (this.isEditing && this.selectedFaq) {
      this.faqService.updateFaq(this.selectedFaq.id, this.formFaq).subscribe({
        next: () => { this.loadFaqs(); this.closeModal(); },
        error: () => this.error = 'Failed to update FAQ'
      });
    } else {
      this.faqService.addFaq(this.formFaq).subscribe({
        next: () => { this.loadFaqs(); this.ensureValidPage(); this.closeModal(); },
        error: () => this.error = 'Failed to add FAQ'
      });
    }
  }

  deleteFaq(id: number) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      this.faqService.deleteFaq(id).subscribe({
        next: () => { this.loadFaqs(); this.ensureValidPage(); },
        error: () => this.error = 'Failed to delete FAQ'
      });
    }
  }

  // Helper methods for Bootstrap modal
  private showModal(id: string) {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      // @ts-ignore
      const modal = new window.bootstrap.Modal(modalEl, { backdrop: false });
      modal.show();
    }
  }

  private hideModal(id: string) {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      // @ts-ignore
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  }
} 