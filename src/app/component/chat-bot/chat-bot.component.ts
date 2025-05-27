import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { ApiEndpoints } from '../../constants/api-endpoints';
import { ChatbotService } from '../../services/chatbot.service';
import { LinebreaksPipe } from './linebreaks.pipe';
// Define interfaces for API response
interface QuickReply {
  text: string;
  payload: string;
}

interface SuggestedArticle {
  title: string;
  content: string;
}

interface ChatbotApiResponse {
  responseMessage: string;
  quickReplies: QuickReply[];
  suggestedArticles: SuggestedArticle[];
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, LinebreaksPipe],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  
})
export class ChatBotComponent implements OnInit {
  isOpen = false;
  isMessageView = false;
  currentHelpPage: string | null = null;
  messages: { text: string; isUser: boolean; timestamp: Date; quickReplies?: QuickReply[]; suggestedArticles?: SuggestedArticle[] }[] = [];
  message = '';
  isChatPage = false;
  showChatbotButton = true;
  isLoading = false;
  showHelpSection: boolean = false;
  activeNavItem: string = 'home';
  isMaximized: boolean = false;
  userMaximizedPreference: boolean = false;
  helpSearch: string = '';
  faqs: any[] = [];
  filteredFaqs: any[] = [];
  currentFaqAnswer: any = null;
  hasUnreadMessages = true;
  
  // Updated API URL - removed https for localhost development
  private apiUrl = (`${ApiEndpoints.CHATBOT}`);

  constructor(private router: Router, private http: HttpClient,private chatbotService: ChatbotService) {
    // Initialize with welcome message
    this.messages.push({
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showChatbotButton = true;
      }
    });
    this.activeNavItem = 'home';
    // Fetch FAQs from backend
    this.http.get<any[]>('https://localhost:62627/api/Faq').subscribe(faqs => {
      this.faqs = faqs;
      this.filteredFaqs = faqs;
    });
  }

private callChatbotApi(userMessage: string): Observable<ChatbotApiResponse | null> {
  return this.chatbotService.sendMessage(userMessage).pipe(
    catchError(error => {
      console.error('API call failed:', error);
      
      let errorMessage = "I'm experiencing some technical difficulties. Please try again later or contact support.";
      if (error.status === 0) {
        errorMessage = "Unable to connect to the server. Please check your internet connection or try again later.";
      } else if (error.status === 404) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.status >= 500) {
        errorMessage = "Server error occurred. Please try again in a few moments.";
      }

      return of({
        responseMessage: errorMessage,
        quickReplies: [],
        suggestedArticles: []
      });
    })
  );
}

  // Generate session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  scrollToChatbot() {
    const chatbot = document.querySelector('.chatbot-container');
    if (chatbot) {
      chatbot.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.toggleChat();
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    console.log(this.isOpen ? 'open' : 'close');

    if (this.isOpen) {
      this.isMessageView = false;
      this.currentHelpPage = null;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    this.userMaximizedPreference = this.isMaximized;
  }

  showMessageView(): void {
    this.isMessageView = true;
    this.currentHelpPage = null;
    this.isMaximized = this.userMaximizedPreference;
    // Load initial API response when first entering message view
    if (this.messages.length === 1) {
      this.loadInitialApiResponse();
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Load initial response from API when entering chat
  private loadInitialApiResponse(): void {
    this.isLoading = true;
    // Send empty string or "hello" for initial greeting
    this.callChatbotApi('hello').subscribe(response => {
      this.isLoading = false;
      if (response) {
        // Replace the initial message with API response
        this.messages[0] = {
          text: response.responseMessage,
          isUser: false,
          timestamp: new Date(),
          quickReplies: response.quickReplies,
          suggestedArticles: response.suggestedArticles
        };
      }
      this.scrollToBottom();
    });
  }

  showHelpPage(page: string): void {
    this.currentHelpPage = page;
    this.isMessageView = false;
  }

  backToMain(): void {
    this.isMessageView = false;
    this.currentHelpPage = null;
    this.currentFaqAnswer = null;
    this.isMaximized = false;
  }

  // Handle original quick replies and API payload-based replies
  selectQuickReply(topic: string): void {
    let replyText = '';
    
    switch(topic) {
      case 'platform':
        replyText = 'This is platform related';
        break;
      case 'auction':
        replyText = 'This is auction or asset related';
        break;
      case 'issue':
        replyText = 'Report an issue';
        break;
      case 'other':
        replyText = 'I have another question';
        break;
      // Handle API payload-based quick replies
      case 'bid':
        replyText = 'Bidding Help';
        break;
      case 'register':
        replyText = 'Registration Help';
        break;
      case 'deposit':
        replyText = 'Deposit Issues';
        break;
      default:
        replyText = topic;
    }
    
    // Add user message
    this.messages.push({
      text: replyText,
      isUser: true,
      timestamp: new Date()
    });
    
    this.scrollToBottom();
    this.isLoading = true;
    
    // Call API with the selected topic/payload
    this.callChatbotApi(topic).subscribe(response => {
      this.isLoading = false;
      if (response) {
        this.messages.push({
          text: response.responseMessage,
          isUser: false,
          timestamp: new Date(),
          quickReplies: response.quickReplies,
          suggestedArticles: response.suggestedArticles
        });
      }
      this.scrollToBottom();
    });
  }

  // Handle API quick reply clicks
  handleQuickReply(quickReply: QuickReply): void {
    // Add user message
    this.messages.push({
      text: quickReply.text,
      isUser: true,
      timestamp: new Date()
    });
    
    this.scrollToBottom();
    this.isLoading = true;
    
    // Call API with payload
    this.callChatbotApi(quickReply.payload).subscribe(response => {
      this.isLoading = false;
      if (response) {
        this.messages.push({
          text: response.responseMessage,
          isUser: false,
          timestamp: new Date(),
          quickReplies: response.quickReplies,
          suggestedArticles: response.suggestedArticles
        });
      }
      this.scrollToBottom();
    });
  }

  // Handle suggested article clicks
  handleSuggestedArticle(article: SuggestedArticle): void {
    // Add user message
    this.messages.push({
      text: `Tell me about: ${article.title}`,
      isUser: true,
      timestamp: new Date()
    });
    
    // Add article content as bot response
    this.messages.push({
      text: article.content,
      isUser: false,
      timestamp: new Date()
    });
    
    this.scrollToBottom();
  }

  // Send user message
  sendMessage(): void {
    if (this.message.trim() === '' || this.isLoading) return;
    
    const userMessage = this.message.trim();
    
    // Add user message to chat
    this.messages.push({
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    });
    
    this.message = ''; // Clear input
    this.scrollToBottom();
    this.isLoading = true;
    
    // Call API
    this.callChatbotApi(userMessage).subscribe(response => {
      this.isLoading = false;
      if (response) {
        this.messages.push({
          text: response.responseMessage,
          isUser: false,
          timestamp: new Date(),
          quickReplies: response.quickReplies,
          suggestedArticles: response.suggestedArticles
        });
      }
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messageContent = document.querySelector('.message-content');
      if (messageContent) {
        messageContent.scrollTop = messageContent.scrollHeight;
      }
    }, 100);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }


  goToHome(): void {
  this.isMessageView = false;
  this.currentHelpPage = null;
}

handleFaqQuestion(questionId: string): void {
  this.currentHelpPage = `faq-${questionId}`;
}

handleNavigation(navItem: string): void {
  // Prevent navigation if in message or help answer page
  if (this.isMessageView || this.currentHelpPage) return;
  this.activeNavItem = navItem;
  this.isMaximized = false; // Always minimize on navigation
  switch (navItem) {
    case 'home':
      this.isMessageView = false;
      this.currentHelpPage = null;
      this.showHelpSection = false;
      break;
    case 'messages':
      this.showMessageView();
      this.showHelpSection = false;
      break;
    case 'help':
      this.isMessageView = false;
      this.currentHelpPage = null;
      this.showHelpSection = false;
      this.openHelpSection();
      break;
  }
}

openHelpSection(): void {
  this.showHelpSection = true;
  this.isMessageView = false;
  this.currentHelpPage = null;
  this.activeNavItem = 'help';
}

filterFaq() {
  const search = this.helpSearch.toLowerCase();
  this.filteredFaqs = this.faqs.filter(f => f.question.toLowerCase().includes(search));
}

showFaqAnswer(faq: any) {
  this.currentFaqAnswer = faq;
  this.currentHelpPage = 'faq';
}

get homeFaqs() {
  return this.faqs.filter(q => q.tags && q.tags.toLowerCase().includes('home')).slice(0, 4);
}

/**
 * Helper to remove '- ' prefix from a string (for displaying points)
 */
removeDashPrefix(point: string): string {
  return point.startsWith('- ') ? point.substring(2) : point;
}

/**
 * Format a line: if it contains an SVG or emoji, wrap it for styling and start on a new line
 */
public formatLineWithIcon(line: string): string {
  // Simple check for SVG or emoji (emoji: unicode range, SVG: <svg)
  const svgRegex = /<svg[\s\S]*?<\/svg>/i;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (svgRegex.test(line)) {
    return `<span class='icon-line'>${line}</span>`;
  } else if (emojiRegex.test(line)) {
    return `<span class='emoji-line'>${line}</span>`;
  } else {
    return line;
  }
}

}