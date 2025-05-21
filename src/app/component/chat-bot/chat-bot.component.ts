import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit {
  isOpen = false;
  isMessageView = false;
  currentHelpPage: string | null = null;
  messages: { text: string; isUser: boolean; timestamp: Date }[] = [];
  message = '';
  isChatPage = false;
  showChatbotButton = true; // Changed from isChatPage to always show by default

  constructor(private router: Router) {
    this.messages.push({
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {

        // this.isChatPage = this.router.url === '/chat-bot';
          this.showChatbotButton = true;
      }
    });
  }

  scrollToChatbot() {
    const chatbot = document.querySelector('.chatbot-container');
    if (chatbot) {
      chatbot.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If chatbot isn't in view, toggle it open
      this.toggleChat();
    }
  }



//    toggleChat() {
//   this.isOpen = !this.isOpen;

//   if (this.isOpen) {
//     this.isMessageView = false;
//     this.currentHelpPage = null;
//     setTimeout(() => this.scrollToBottom(), 100);
//     console.log("open");
    
//   }
//   if(!this.isOpen){
//     console.log("close");
//   }
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

  showMessageView(): void {
    this.isMessageView = true;
    this.currentHelpPage = null;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  showHelpPage(page: string): void {
    this.currentHelpPage = page;
    this.isMessageView = false;
  }

  backToMain(): void {
    this.isMessageView = false;
    this.currentHelpPage = null;
  }

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
      default:
        replyText = topic;
    }
    
    this.messages.push({
      text: replyText,
      isUser: true,
      timestamp: new Date()
    });
    
    setTimeout(() => {
      this.simulateBotResponse(replyText);
    }, 1000);
  }

  sendMessage(): void {
    if (this.message.trim() === '') return;
    
    this.messages.push({
      text: this.message,
      isUser: true,
      timestamp: new Date()
    });
    
    const sentMessage = this.message;
    this.message = '';
    
    this.scrollToBottom();
    
    setTimeout(() => {
      this.simulateBotResponse(sentMessage);
    }, 1000);
  }

  private simulateBotResponse(userMessage: string): void {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    let response = "I'm not sure how to respond to that. Can you please provide more details?";
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = "Hello! How can I assist you today?";
    } else if (lowerCaseMessage.includes('help')) {
      response = "I'm here to help! What do you need assistance with?";
    } else if (lowerCaseMessage.includes('bid') || lowerCaseMessage.includes('auction')) {
      response = "To place a bid, navigate to the item details page and click on the 'Place Bid' button. Make sure you're logged in first!";
    } else if (lowerCaseMessage.includes('login') || lowerCaseMessage.includes('sign')) {
      response = "You can log in by clicking the 'Login' button in the top navigation bar.";
    } else if (lowerCaseMessage.includes('register') || lowerCaseMessage.includes('account')) {
      response = "To register for an account, click the 'Sign Up' button and fill out the registration form.";
    } else if (lowerCaseMessage.includes('platform')) {
      response = "Our platform offers secure bidding and direct sales for premium assets. Is there something specific about the platform you'd like to know?";
    } else if (lowerCaseMessage.includes('issue')) {
      response = "I'm sorry to hear you're experiencing an issue. Could you provide more details about what's happening? Our team will help resolve it.";
    }
    
    this.messages.push({
      text: response,
      isUser: false,
      timestamp: new Date()
    });
    
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}