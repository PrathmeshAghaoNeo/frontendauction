import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone:true,
  imports:[CommonModule,RouterOutlet,RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  showDepositMenu = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  toggleDepositMenu() {
    this.showDepositMenu = !this.showDepositMenu;
  }

  navigateTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
}
