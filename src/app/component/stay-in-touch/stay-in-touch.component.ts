import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiEndpoints } from '../../constants/api-endpoints';

interface SocialAccount {
  name: string;
  url: string;
  handle: string;
  connected: boolean;
  apiLink?: string;
}

interface FooterLinkSettings {
  twitterLink: string;
  instagramLink: string;
  facebookLink: string;
  linkedInLink: string;
  youTubeLink: string;
}

@Component({
  selector: 'app-stay-in-touch',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './stay-in-touch.component.html',
  styleUrls: ['./stay-in-touch.component.scss']
})
export class StayInTouchComponent implements OnInit {
  // Optional input to receive edit mode from parent component
  @Input() parentEditMode: boolean = false;
  
  // Social media accounts
  socialAccounts: SocialAccount[] = [
    {
      name: 'Instagram',
      url: '',
      handle: '',
      connected: false
    },
    {
      name: 'Twitter',
      url: '',
      handle: '',
      connected: false
    },
    {
      name: 'Facebook',
      url: '',
      handle: '',
      connected: false
    },
    {
      name: 'LinkedIn',
      url: '',
      handle: '',
      connected: false
    },
    {
      name: 'YouTube',
      url: '',
      handle: '',
      connected: false
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSocialMediaLinks();
  }

  fetchSocialMediaLinks(): void {
    this.http.get<FooterLinkSettings>(ApiEndpoints.FOOTERLINKSETTINGS).subscribe({
      next: (data) => {
        // Update social accounts with API data
        this.updateSocialAccounts(data);
      },
      error: (err) => {
        console.error('Error fetching social media links:', err);
      }
    });
  }

  updateSocialAccounts(data: FooterLinkSettings): void {
    // Map API response to social accounts
    this.socialAccounts.forEach(account => {
      switch(account.name) {
        case 'Instagram':
          account.apiLink = data.instagramLink;
          account.url = data.instagramLink;
          account.connected = !!data.instagramLink;
          account.handle = account.connected ? this.extractHandle(data.instagramLink) : '';
          break;
        case 'Twitter':
          account.apiLink = data.twitterLink;
          account.url = data.twitterLink;
          account.connected = !!data.twitterLink;
          account.handle = account.connected ? this.extractHandle(data.twitterLink) : '';
          break;
        case 'Facebook':
          account.apiLink = data.facebookLink;
          account.url = data.facebookLink;
          account.connected = !!data.facebookLink;
          account.handle = account.connected ? this.extractHandle(data.facebookLink) : '';
          break;
        case 'LinkedIn':
          account.apiLink = data.linkedInLink;
          account.url = data.linkedInLink;
          account.connected = !!data.linkedInLink;
          account.handle = account.connected ? this.extractHandle(data.linkedInLink) : '';
          break;
        case 'YouTube':
          account.apiLink = data.youTubeLink;
          account.url = data.youTubeLink;
          account.connected = !!data.youTubeLink;
          account.handle = account.connected ? this.extractHandle(data.youTubeLink) : '';
          break;
      }
    });
  }

  // Helper method to extract handle from URL
  extractHandle(url: string): string {
    if (!url) return '';
    
    try {
      // Remove protocol and domain, keep only the path
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    } catch (error) {
      console.error('Invalid URL format:', url);
      return url; // Return the original string if URL parsing fails
    }
  }

  // Connect to social media account
  connect(account: SocialAccount): void {
    if (account.apiLink) {
      window.open(account.apiLink, '_blank');
      // In a real implementation, you would handle the OAuth flow
      // This is a simulation for demonstration purposes
      setTimeout(() => {
        account.connected = true;
        account.handle = this.extractHandle(account.apiLink || '');
      }, 1000);
    }
  }

  // Disconnect social media account
  disconnect(account: SocialAccount): void {
    account.connected = false;
    account.handle = '';
    // In a real implementation, you would call an API to remove the connection
  }
}