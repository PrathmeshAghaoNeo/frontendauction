import { Component } from '@angular/core';
import { RoleWithPermissionsService } from '../../services/roles.service';
import { Router, RouterModule } from '@angular/router';
import { RoleWithPermissions } from '../../modals/roles';
import { RoleFormComponent } from '../role-form-component/role-form-component';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [RouterModule, RoleFormComponent],
  template: `<h2>Create Role</h2>
             <app-role-form (formSubmit)="onCreate($event)"></app-role-form>`,
  styleUrl: './role-create-component.css'
})
export class RoleCreateComponent {
  constructor(
    private roleService: RoleWithPermissionsService,
    private router: Router
  ) { }

  onCreate(role: RoleWithPermissions) {
    this.roleService.createRoleWithPermissions(role).subscribe({
      next: () => {
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        console.error('Create failed', err);
      }
    });

  }
}
