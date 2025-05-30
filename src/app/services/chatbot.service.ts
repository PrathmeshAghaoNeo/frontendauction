import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiEndpoints } from '../constants/api-endpoints';
import { AuthService } from './auth.service';

// Define interfaces for API request and response
export interface ChatbotRequest {
  message: string;    
  userId: number | null;   
}

export interface QuickReply {
  text: string;
  payload: string;
}

export interface SuggestedArticle {
  title: string;
  content: string;
}

export interface ChatbotApiResponse {
  responseMessage: string;
  quickReplies: QuickReply[];
  suggestedArticles: SuggestedArticle[];
  isEndOfChat: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Send message to chatbot API
   */
  sendMessage(userMessage: string, sessionId?: string): Observable<ChatbotApiResponse> {
    // Get current user ID from JWT token, or use null for anonymous users
    const userId = this.authService.getUserIdJwt() || null;
    
    const payload: ChatbotRequest = {
      message: userMessage,    
      userId: userId          // Now using integer or null
    };

    console.log('Chatbot API call to:', ApiEndpoints.CHATBOT);
    console.log('Payload:', payload);

    return this.http.post<ChatbotApiResponse>(ApiEndpoints.CHATBOT, payload, this.getHeaders()).pipe(
      tap(response => {
        console.log('Chatbot API Response received:', response);
      }),
      catchError(error => {
        console.error('Chatbot API call failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Return fallback response with more specific error info
        let errorMessage = "I'm experiencing some technical difficulties. Please try again later or contact support.";
        
        if (error.status === 0) {
          errorMessage = "Unable to connect to the server. Please check your internet connection or try again later.";
        } else if (error.status === 400) {
          errorMessage = "There was an issue with your request. Please try rephrasing your message.";
        } else if (error.status === 404) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else if (error.status >= 500) {
          errorMessage = "Server error occurred. Please try again in a few moments.";
        }
        
        return throwError({
          responseMessage: errorMessage,
          quickReplies: [],
          suggestedArticles: []
        });
      })
    );
  }

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Helper method to get request headers
   */
  private getHeaders() {
    const token = localStorage.getItem('jwtToken');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }
}