import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Role, Status, UserView } from '../../modals/user';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {

  users: UserView[] = [];
  roles: Role[] = [];
  statuses: Status[] = [];

  // Filter properties
  searchTerm: string = '';
  filterRole: number = 0;
  filterStatus: number = 0;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStatuses();
  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe(data => this.users = data);
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(data => this.roles = data);
  }

  loadStatuses(): void {
    this.userService.getStatuses().subscribe(data => this.statuses = data);
  }

  getRoleName(roleId: number): string {
    return this.roles.find(r => r.roleId === roleId)?.roleName || 'Unknown';
  }

  getStatusName(statusId: number): string {
    return this.statuses.find(s => s.statusId === statusId)?.statusName || 'Unknown';
  }

  openAddUserModal(): void {
    this.router.navigate(['/newUser']);
  }

  editUser(user: UserView): void {
    if (user?.userId) {
      const encodedUserId = btoa(user.userId.toString());
      this.router.navigate(['/updateUser'], { queryParams: { id: encodedUserId } });
    } else {
      console.error('Invalid userId');
    }
  }

  viewUser(user: UserView): void {
    if (user?.userId) {
      const encodedUserId = btoa(user.userId.toString());
      this.router.navigate(['/detailsUser'], { queryParams: { id: encodedUserId } });
    } else {
      console.error('Invalid userId');
    }
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('User deleted successfully!');
        this.loadUsers();
      },
      error: (error) => console.error('Error deleting user:', error)
    });
  }

  get roleOptions() {
    return this.roles;
  }

  get filteredUsers(): UserView[] {
    return this.users.filter(user => {
      const matchesSearch = this.searchTerm.trim().length === 0 ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.mobileNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = this.filterRole === 0 || user.roleId === this.filterRole;
      const matchesStatus = this.filterStatus === 0 || user.statusId === this.filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

}
