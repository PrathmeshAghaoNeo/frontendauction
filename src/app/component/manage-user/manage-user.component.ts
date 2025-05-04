import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Role, Status, UserView } from '../../modals/user';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxPaginationModule ],
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {

  users: UserView[] = [];
  roles: Role[] = [];
  statuses: Status[] = [];
  page: number = 1;
  itemsPerPage: number = 5;

  // for filters
  searchTerm: string = '';
  filterRole: number = 0;
  filterStatus: number = 0;


  //sorting
  sortColumn: string = 'uid';
  sortDirection: string = 'asc';
  sortKey: keyof UserView | null = null;
  sortAsc: boolean = true;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStatuses();
  }

  loadUsers(): void {
    this.userService.getAllUser().subscribe(data => {
      this.users = data
      
    });
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'User has been deleted.',
              'success'
            );
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            Swal.fire('Error', 'Failed to delete user.', 'error');
          }
        });
      }
    });
  }
  
  

  get roleOptions() {
    return this.roles;
  }

  get filteredUsers(): UserView[] {
    // Convert filterRole and filterStatus to numbers to ensure accurate comparison
    const roleFilter = this.filterRole ? Number(this.filterRole) : 0;
    const statusFilter = this.filterStatus ? Number(this.filterStatus) : 0;
  
    return this.users.filter(user => {
      const matchesSearch = this.searchTerm.trim().length === 0 ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.mobileNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
        user.uid.toString().includes(this.searchTerm);

  
      const matchesRole = roleFilter === 0 || user.roleId === roleFilter;
      const matchesStatus = statusFilter === 0 || user.statusId === statusFilter;
  
      return matchesSearch && matchesRole && matchesStatus;
    });
  }
   // Sorting logic
   sortData(key: keyof UserView) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  
    this.users.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
  
      if (aValue == null) return 1;
      if (bValue == null) return -1;
  
      return this.sortAsc
        ? aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        : aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });
  }
  
}