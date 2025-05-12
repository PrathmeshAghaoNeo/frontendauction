import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { positiveIntegerValidator,AuctionSettings, FinanceSettings, DirectSaleSettings, StaticPagesSettings, FooterLinksSettings } from '../../modals/settings';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})


export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  viewMode = true; // true = viewing, false = editing
  latestSettings: any = {};
  editMode = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.initForm();
    this.showSettings(); // Load settings on init
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      auctionSettings: this.fb.group({
        globalIncrementalTimeInMinutes: [null, [Validators.required, positiveIntegerValidator]],
      }),
      financeSettings: this.fb.group({
        vatPercent: [null, [Validators.required, positiveIntegerValidator]],
        creditCardFee: [null, [Validators.required, positiveIntegerValidator]],
        debitCardFee: [null, [Validators.required, positiveIntegerValidator]],
        adminFees: [null, [Validators.required, positiveIntegerValidator]],
        auctionFees: [null, [Validators.required, positiveIntegerValidator]],
        buyerCommissionPercent: [null, [Validators.required, positiveIntegerValidator]],
      }),
      directSaleSettings: this.fb.group({
        cartItemsLimit: [null, [Validators.required, positiveIntegerValidator]],
        cartTimerInMinutes: [null, [Validators.required, positiveIntegerValidator]],
      }),    
      staticPages: this.fb.group({
        privacyPolicy: ['', Validators.required],
        termsAndConditions: ['', Validators.required],
        cookiesPolicy: ['', Validators.required],
      }),
      footerLinks: this.fb.group({
        faq: ['', Validators.required],
        blog: ['', Validators.required],
        twitterLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        instagramLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        facebookLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        linkedInLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        youTubeLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        appStoreLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        googlePlayLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
        status: ['', Validators.required],
      })
    });
  }

  showSettings(): void {
    this.settingsService.getAllSettings().subscribe({
      next: (data) => {
        // Assuming each section is an array and you want the last one in each
        this.latestSettings = {
          auctionSettings: Array.isArray(data.auctionSettings) ? data.auctionSettings[data.auctionSettings.length - 1] : data.auctionSettings,
          financeSettings: Array.isArray(data.financeSettings) ? data.financeSettings[data.financeSettings.length - 1] : data.financeSettings,
          directSaleSettings: Array.isArray(data.directSaleSettings) ? data.directSaleSettings[data.directSaleSettings.length - 1] : data.directSaleSettings,
          staticPages: Array.isArray(data.staticPages) ? data.staticPages[data.staticPages.length - 1] : data.staticPages,
          footerLinks: Array.isArray(data.footerLinks) ? data.footerLinks[data.footerLinks.length - 1] : data.footerLinks,
        
        };

        // Patching the form with the latest settings data
        this.settingsForm.patchValue({
          auctionSettings: this.latestSettings.auctionSettings,
          financeSettings: this.latestSettings.financeSettings,
          directSaleSettings: this.latestSettings.directSaleSettings,
          staticPages: this.latestSettings.staticPages,
          footerLinks: this.latestSettings.footerLinks
        });

        this.viewMode = true;
        //console.log(this.latestSettings); // For debugging
        console.log(this.latestSettings);

      },
      error: (error: any) => {
        console.error('Failed to load settings:', error);
      }
    });
  }

  cancelEdit() {
    this.viewMode = true;
    this.editMode = false;
    this.settingsForm.patchValue(this.latestSettings); // Revert to original settings
  }

  editSettings(): void {
    this.viewMode = false;
    this.editMode = true;

  }


  formSubmitAttempted = false;
  logValidationErrors(group: FormGroup, path: string = ''): void {
    Object.keys(group.controls).forEach(controlName => {
      const control = group.get(controlName);
      const currentPath = path ? `${path}.${controlName}` : controlName;
  
      if (control instanceof FormGroup) {
        this.logValidationErrors(control, currentPath);
      } else if (control?.invalid) {
        console.error(`Invalid field: ${currentPath}`);
        console.table(control.errors);
      }
    });
  }
  
  onSubmit(): void {
    this.formSubmitAttempted = true;

    if (this.settingsForm.invalid) {
      console.error('Form submission failed. Errors found:');
      this.logValidationErrors(this.settingsForm);
      this.settingsForm.markAllAsTouched(); // Mark all fields to show errors
      return;
    }
    const formValue = this.settingsForm.value;
  
    if (this.settingsForm.dirty) {
      const auctionPayload = {
        ...formValue.auctionSettings,
        id: this.latestSettings.auctionSettings?.id
      };
  
      const financePayload = {
        ...formValue.financeSettings,
        id: this.latestSettings.financeSettings?.id
      };
  
      const directSalePayload = {
        ...formValue.directSaleSettings,
        id: this.latestSettings.directSaleSettings?.id
      };
  
      const staticPagesPayload = {
        ...formValue.staticPages,
        id: this.latestSettings.staticPages?.id
      };
  
      const footerLinksPayload = {
        ...formValue.footerLinks,
        id: this.latestSettings.footerLinks?.id
      };


      console.log("footer values: "+footerLinksPayload);
      console.log(auctionPayload);
      console.log(directSalePayload);
      console.log(staticPagesPayload);
      console.table(footerLinksPayload);
      console.log(footerLinksPayload);

      console.log(footerLinksPayload.key);
      
  
      this.settingsService.updateAuctionSettings(auctionPayload).subscribe({
        next: (response: any) => console.log(response),
        error: (error: any) => console.error(error)
      });
  
      this.settingsService.updateFinanceSettings({financeSettings: financePayload }).subscribe({
        next: (response: any) => console.log(response),
        error: (error: any) => console.error(error)
      });
  
      this.settingsService.updateDirectSaleSettings(directSalePayload).subscribe({
        next: (response: any) => console.log(response),
        error: (error: any) => console.error(error)
      });
  
      this.settingsService.updateStaticPagesSettings({settingsDto:staticPagesPayload}).subscribe({
        next: (response: any) => console.log(response),
        error: (error: any) => console.error(error)
      });
  
      this.settingsService.updateFooterLinksSettings({footerLinksSettings:footerLinksPayload}).subscribe({
        
        next: (response: any) => console.log(response),
        error: (error: any) => console.error(error)
      });
    }
  
    this.viewMode = true;
    this.showSettings(); // Refresh with latest saved settings

  }
  

}
