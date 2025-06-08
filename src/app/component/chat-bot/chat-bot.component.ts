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
  isEndOfChat: boolean;
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
  
  mainMenuOptions: QuickReply[] = [];
  isEndOfChat: boolean = false;
  expandedFaqIndexes: Set<number> = new Set(); // Track expanded FAQ indices

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
        suggestedArticles: [],
        isEndOfChat: false
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

//   private scrollToChatbot(): void {
//   setTimeout(() => {
//     const container = document.querySelector('.message-content');
//     if (container) {
//       container.scrollTop = container.scrollHeight;
//     }
//   }, 100);
// }

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
        this.isEndOfChat = !!response.isEndOfChat;
        this.mainMenuOptions = response.quickReplies || [];
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
    this.isMaximized = false;
  }

  // Handle API quick replies
  handleQuickReply(quickReply: QuickReply): void {
    // If user clicks "Start Over", reset the chat
    if ((quickReply.payload || '').toLowerCase() === 'start_over' || (quickReply.text || '').toLowerCase() === 'start over') {
      this.messages = [{
        text: 'Hello! How can I help you today?',
        isUser: false,
        timestamp: new Date()
      }];
      this.isLoading = true;
      this.callChatbotApi('hello').subscribe(response => {
        this.isLoading = false;
        if (response) {
          this.isEndOfChat = !!response.isEndOfChat;
          this.mainMenuOptions = response.quickReplies || [];
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
      return;
    }
    // Add the quick reply as a user message
    this.messages.push({
      text: quickReply.text,
      isUser: true,
      timestamp: new Date()
    });
    this.isLoading = true;
    // Send payload (ID) if available, otherwise send text
    const messageToSend = quickReply.payload || quickReply.text;
    this.callChatbotApi(messageToSend).subscribe(response => {
      this.isLoading = false;
      if (response) {
        this.isEndOfChat = !!response.isEndOfChat;
        this.mainMenuOptions = response.quickReplies || [];
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
    this.scrollToBottom();
  }

  // Send user message to chatbot
  sendMessage(): void {
    const userMessage = this.message.trim();
    if (!userMessage) return;
    this.messages.push({
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    });
    this.isLoading = true;
    this.callChatbotApi(userMessage).subscribe(response => {
      this.isLoading = false;
      if (response) {
        this.isEndOfChat = !!response.isEndOfChat;
        this.mainMenuOptions = response.quickReplies || [];
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
    this.message = '';
    this.scrollToBottom();
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

toggleFaq(index: number): void {
  if (this.expandedFaqIndexes.has(index)) {
    this.expandedFaqIndexes.delete(index);
  } else {
    this.expandedFaqIndexes.add(index);
  }
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

handleSuggestedArticle(article: SuggestedArticle) {
  // You can implement this as needed
  console.log('Suggested article clicked:', article);
}

}


// jkjjkj