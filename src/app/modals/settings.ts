export interface AuctionSettings {
  id?: number;
  globalIncrementalTimeInMinutes: number;
}
 
export interface FinanceSettings {
  id?: number;
  vatPercent: number;
  creditCardFee: number;
  debitCardFee: number;
  adminFees: number;
  auctionFees: number;
  buyerCommissionPercent: number;
}

export interface UpdateFinanceSettingsCommand {
  financeSettings: FinanceSettings;
}
 
export interface DirectSaleSettings {
  id?: number;
  cartItemsLimit: number;
  cartTimerInMinutes: number;
}
 
export interface StaticPagesSettings {
  id?: number;
  privacyPolicy: string;
  termsAndConditions: string;
  cookiesPolicy: string;
}
 
export interface FooterLinksSettings {
  id?: number;
  faq: string;
  blog: string;
  status: string;
  twitterLink: string;
  instagramLink: string;
  facebookLink: string;
  linkedInLink: string;
  youTubeLink: string;
  appStoreLink: string;
  googlePlayLink: string;
}
export interface AllSettings {
  id?: number;
  auctionSettings: AuctionSettings;
  financeSettings: FinanceSettings;
  directSaleSettings: DirectSaleSettings;
  staticPages: StaticPagesSettings;
  footerLinks: FooterLinksSettings;
}
 

import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function positiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value !== null && (isNaN(value) || value <= 0 || !Number.isInteger(+value))) {
    return { positiveInteger: true };
  }
  return null;
}
