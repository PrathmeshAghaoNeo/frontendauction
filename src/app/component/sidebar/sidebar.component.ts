import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoleWithPermissionsService } from '../../services/roles.service';
import { MENU_CONFIG } from './menu.config';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  filteredMenu: any[] = [];

  constructor(private permissionService: RoleWithPermissionsService) {}

  ngOnInit(): void {
    this.filteredMenu = MENU_CONFIG.filter(item =>
      this.permissionService.hasPermission(item.permission)
    );
  }
}
