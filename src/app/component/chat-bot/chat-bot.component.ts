import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent {
  isChatOpen = true; // True by default since we don't need the button
  isMessageView = false;
  currentHelpPage = '';
  message = ''; // For binding to input field
  
  // Show message input view
  showMessageView() {
    this.isMessageView = true;
    this.currentHelpPage = '';
  }
  
  // Show help page based on topic
  showHelpPage(topic: string) {
    this.currentHelpPage = topic;
    this.isMessageView = false;
  }
  
  // Return to main menu
  backToMain() {
    this.isMessageView = false;
    this.currentHelpPage = '';
  }
  
  // Select quick reply
  selectQuickReply(reply: string) {
    // Handle quick reply selection logic here
    console.log('Selected quick reply:', reply);
    // You could add the reply to message history and trigger a response
  }
  
  // Send message
  sendMessage() {
    if (this.message.trim()) {
      // Handle message sending logic here
      console.log('Sending message:', this.message);
      // You would typically add this message to chat history
      // and trigger a response from the chatbot
      this.message = '';
    }
  }
}