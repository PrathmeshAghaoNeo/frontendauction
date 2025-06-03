export interface RoleWithPermissions {
  roleId: number;
  roleName: string;
  isSeller: boolean;
  superAdmin: boolean;
  accessAdminPanel: boolean;
  manageAuctions: boolean;
  manageAssets: boolean;
  manageTransactions: boolean;
  manageCategories: boolean;
  manageRoles: boolean;
  manageUsers: boolean;
  viewReports: boolean;
  exportReports: boolean;
  manageRequests: boolean;
  viewAuditTrail: boolean;
  changeCommission: boolean;
}

export type PermissionKey = {
  [K in keyof RoleWithPermissions]: RoleWithPermissions[K] extends boolean ? K : never;
}[keyof RoleWithPermissions];
