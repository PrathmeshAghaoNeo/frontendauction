import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

  // Success popup properties
  showSuccessPopup: boolean = false;
  successMessage: string = '';


   // NgxPagination properties
  itemsPerPage: number = 5;
  page: number = 1;

  isModalOpen: boolean = false;

  showViewModal: boolean = false;
  showAddEditModal: boolean = false;

  @Output() modalState = new EventEmitter<boolean>();

  categories: string[] = [];

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaqs();
    this.loadCategories();
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

  loadCategories() {
    this.faqService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map((item: any) => item.category);
      },
      error: (err) => {
        this.categories = [];
      }
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
    this.showViewModal = true;
    this.isModalOpen = true;
    this.modalState.emit(true);
  }

  closeViewModal() {
    this.viewFaqObj = null;
    this.showViewModal = false;
    this.isModalOpen = false;
    this.modalState.emit(false);
  }

  openAddModal() {
    this.isEditing = false;
    this.formFaq = {};
    this.showAddEditModal = true;
    this.isModalOpen = true;
    this.modalState.emit(true);
  }

  openEditModal(faq: ChatbotAdminFaq) {
    this.isEditing = true;
    this.selectedFaq = { ...faq };
    this.formFaq = this.selectedFaq;
    this.showAddEditModal = true;
    this.isModalOpen = true;
    this.modalState.emit(true);
  }

  closeModal() {
    this.isEditing = false;
    this.selectedFaq = null;
    this.formFaq = {};
    this.showAddEditModal = false;
    this.isModalOpen = false;
    this.modalState.emit(false);
  }

  // Success popup methods
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessPopup = true;
    this.isModalOpen = true;
    this.showModal('successModal');
  }

  closeSuccessModal() {
    this.showSuccessPopup = false;
    this.successMessage = '';
    this.isModalOpen = false;
    this.hideModal('successModal');
  }

  saveFaq() {
    if (this.isEditing && this.selectedFaq) {
      this.faqService.updateFaq(this.selectedFaq.id, this.formFaq).subscribe({
        next: () => { 
          this.loadFaqs(); 
          this.closeModal(); 
          this.showSuccess('FAQ updated successfully!');
        },
        error: () => this.error = 'Failed to update FAQ'
      });
    } else {
      this.faqService.addFaq(this.formFaq).subscribe({
        next: () => { 
          this.loadFaqs(); 
          this.ensureValidPage(); 
          this.closeModal(); 
          this.showSuccess('FAQ added successfully!');
        },
        error: () => this.error = 'Failed to add FAQ'
      });
    }
  }

  getAllFaq(){
    this.faqService.getFaqs().subscribe((res)=>{
      console.log(res);
      this.faqs = res;
    })

  }

  deleteFaq(id: number) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      this.faqService.deleteFaq(id).subscribe({
        next: () => { 
          this.loadFaqs(); 
          this.ensureValidPage(); 
          this.showSuccess('FAQ deleted successfully!');
        },
        error: () => this.error = 'Failed to delete FAQ'
      });
    }
  }

  // Helper methods for Bootstrap modal - CORRECTED
  private showModal(id: string) {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      // Enable default backdrop
      // @ts-ignore
      const modal = new window.bootstrap.Modal(modalEl, { 
        backdrop: true,  // MUST be true for backdrop
        keyboard: true
      });
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


   // Go back function
        goBack() {
            // In a real Angular app, you would use Router.navigate
            // For demo purposes, we'll just show an alert
            window.history.back();
        }
}