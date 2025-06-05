import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoleWithPermissionsService } from '../../services/roles.service';
import { MENU_CONFIG, MenuItem } from './menu.config';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PermissionKey, RoleWithPermissions } from '../../modals/roles';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: `
    <ul>
      <li *ngFor="let item of filteredMenu">
        <a [routerLink]="item.route">{{ item.label }}</a>
      </li>
    </ul>
  `,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  visibleMenuItems: MenuItem[] = [];
  private roleSubscription?: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to role changes
    this.roleSubscription = this.authService.getRoleObservable().subscribe(role => {
      if (role) {
        const permissions = this.authService.getPermissions();
        this.visibleMenuItems = MENU_CONFIG.filter(menu =>
          permissions.includes(menu.permission)
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe(); // prevent memory leaks
  }
}


