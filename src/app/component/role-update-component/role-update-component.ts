import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleWithPermissions } from '../../modals/roles';
import { RoleWithPermissionsService } from '../../services/roles.service';
import { RoleFormComponent } from '../role-form-component/role-form-component';

@Component({
  selector: 'app-role-update',
  standalone: true,
  imports: [
    RouterModule, RoleFormComponent],
  template: `
    <h2>Edit Role</h2>
    <app-role-form [roleData]="role" (formSubmit)="onUpdate($event)"></app-role-form>
  `,
  styleUrl: './role-update-component.css'
})
export class RoleUpdateComponent implements OnInit {
  role?: RoleWithPermissions;
  roleId!: number;

  constructor(
    private route: ActivatedRoute,
    private roleService: RoleWithPermissionsService,
    private router: Router
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('Route param id:', idParam);

    if (!idParam) {
      console.error('No id param found!');
      return;
    }
    this.roleId = +idParam;

    this.roleService.getRoleWithPermissionsById(this.roleId).subscribe({
      next: (data) => (this.role = data),
      error: (err) => console.error('Failed to load role', err),
    });
  }

 onUpdate(updatedRole: RoleWithPermissions) {
  const payload = { ...updatedRole, roleId: this.roleId };  // Add roleId explicitly
  console.log('Sending update payload:', payload);

  this.roleService.updateRoleWithPermissions(this.roleId, payload).subscribe({
    next: () => this.router.navigate(['/roles']),
    error: (err) => console.error('Update failed', err)
  });
}


}
