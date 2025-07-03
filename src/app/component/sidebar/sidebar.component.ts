import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  templateUrl: './sidebar.component.html',
  imports: [RouterModule, FormsModule, CommonModule],
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  
  isExpanded = false;
  
  @Output() hoverChange = new EventEmitter<boolean>();

  visibleMenuItems: MenuItem[] = [];
  private roleSubscription?: Subscription;
  constructor(private authService: AuthService) { }
  ngOnInit(): void {  
    console.log('%c[Sidebar] ngOnInit triggered', 'color: green');

    // First try to restore from sync value
    const currentRole = this.authService.getRole();
    if (currentRole) {
      console.log('[Sidebar] Synchronously received role:', currentRole);
      this.updateMenu(currentRole);
    }

    this.roleSubscription = this.authService.role$.subscribe((role) => {
      console.log('[Sidebar] Received role from role$:', role); // ✅ confirm this prints!
      if (role) {
        this.updateMenu(role);
      } else {
        this.visibleMenuItems = [];
      }
    });

  }
  onMouseEnter() {
    this.isExpanded = true;
    this.hoverChange.emit(true);
  }

  onMouseLeave() {
    this.isExpanded = false;
    this.hoverChange.emit(false);
  }



  private updateMenu(role: RoleWithPermissions): void {

    const permissions = this.authService.getPermissions();

    this.visibleMenuItems = MENU_CONFIG.filter(menu =>
      permissions.includes(menu.permission)
    );

  }




  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe(); // prevent memory leaks
  }
}


