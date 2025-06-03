import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleWithPermissions } from '../../modals/roles';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleWithPermissionsService } from '../../services/roles.service';

@Component({
  selector: 'app-manage-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.css']  // ✅ fixed `styleUrl` typo
})
export class ManageRolesComponent implements OnInit {
  roles: RoleWithPermissions[] = [];
  filteredRoles: RoleWithPermissions[] = [];
  selectedRole: RoleWithPermissions | null = null;
  searchText: string = '';
  loading = false;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  page = 1;
  itemsPerPage = 10;

  @ViewChild('viewRoleModal') viewRoleModal: any;
  @ViewChild('deleteRoleModal') deleteRoleModal: any;

  constructor(
    private roleService: RoleWithPermissionsService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles(): void {
    this.loading = true;
    this.roleService.getAllRoleWithPermissionss().subscribe({
      next: (res) => {
        this.roles = res;
        this.filteredRoles = [...res];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  getPermissionList(role: RoleWithPermissions): string {
  const permissionsMap: { [key: string]: string } = {
    superAdmin: 'Super Admin',
    accessAdminPanel: 'Access Admin Panel',
    manageAuctions: 'Manage Auctions',
    manageAssets: 'Manage Assets',
    manageTransactions: 'Manage Transactions',
    manageCategories: 'Manage Categories',
    manageRoles: 'Manage Roles',
    manageUsers: 'Manage Users',
    viewReports: 'View Reports',
    exportReports: 'Export Reports',
    manageRequests: 'Manage Requests',
    viewAuditTrail: 'View Audit Trail',
    changeCommission: 'Change Commission',
  };

  const permissions = Object.entries(permissionsMap)
    .filter(([key]) => role[key as keyof RoleWithPermissions])
    .map(([, label]) => label);

  return permissions.length ? permissions.join(', ') : 'No Permissions';
}
getEnabledPermissions(role: RoleWithPermissions): string[] {
    const permissionKeys = Object.keys(role) as (keyof RoleWithPermissions)[];
    return permissionKeys.filter(key => typeof role[key] === 'boolean' && role[key] === true && key !== 'roleId' && key !== 'roleName');
  }
  applyFilters(): void {
    const text = this.searchText.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.roleName.toLowerCase().includes(text)
    );
  }

  sortRoles(column: keyof RoleWithPermissions): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredRoles.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA == null || valB == null) return 0;

      const compare = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.sortDirection === 'asc' ? compare : -compare;
    });
  }

  openViewModal(role: RoleWithPermissions): void {
    this.selectedRole = role;
    this.modalService.open(this.viewRoleModal, { centered: true });
  }

  openDeleteModal(role: RoleWithPermissions): void {
    this.selectedRole = role;
    this.modalService.open(this.deleteRoleModal, { centered: true });
  }

  deleteRoleConfirmed(): void {
    if (!this.selectedRole) return;

    // this.roleService.deleteRole(this.selectedRole.roleId).subscribe(() => {
    //   this.fetchRoles();
    // });
  }

  // exportToExcel(): void {
  //   console.log('Exporting roles...');
  //   // You can implement actual Excel export here later using a library like XLSX
  // }
}
