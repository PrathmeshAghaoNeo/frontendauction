import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RoleWithPermissions } from '../../modals/roles';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './role-form-component.html',
  styleUrl: './role-form-component.css'
})
export class RoleFormComponent implements OnChanges {
  @Input() roleData?: RoleWithPermissions; 
  @Output() formSubmit = new EventEmitter<RoleWithPermissions>();

  roleForm: FormGroup;

  constructor(private fb: FormBuilder) {
  this.roleForm = this.fb.group({
    roleName: ['', [Validators.required, Validators.maxLength(10)]],
    isSeller: [false],
    superAdmin: [false],
    accessAdminPanel: [false],
    manageAuctions: [false],
    manageAssets: [false],
    manageTransactions: [false],
    manageCategories: [false],
    manageRoles: [false],
    manageUsers: [false],
    viewReports: [false],
    exportReports: [false],
    manageRequests: [false],
    viewAuditTrail: [false],
    changeCommission: [false]
  });

  // Auto-toggle permissions based on superAdmin
  this.roleForm.get('superAdmin')?.valueChanges.subscribe((isChecked) => {
    const permissionsToToggle = [
      'accessAdminPanel',
      'manageAuctions',
      'manageAssets',
      'manageTransactions',
      'manageCategories',
      'manageRoles',
      'manageUsers',
      'viewReports',
      'exportReports',
      'manageRequests',
      'viewAuditTrail',
      'changeCommission'
    ];

    for (const permission of permissionsToToggle) {
      this.roleForm.get(permission)?.setValue(isChecked, { emitEvent: false });
    }
  });
}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['roleData'] && this.roleData) {
      this.roleForm.patchValue(this.roleData);
    }
  }

  submitForm() {
    const checkedPermissions = Object.entries(this.roleForm.value)
      .filter(([key, val]) => typeof val === 'boolean' && val === true);


    if (this.roleForm.valid) {
      this.formSubmit.emit(this.roleForm.value);
    } else {
      this.roleForm.markAllAsTouched();
    }
  }

  get roleName() {
    return this.roleForm.get('roleName');
  }
}
