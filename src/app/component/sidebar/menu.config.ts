import { PermissionKey } from "../../modals/roles";

export interface MenuItem {
  label: string;
  route: string;
  permission: PermissionKey;
}

export const MENU_CONFIG: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    permission: 'accessAdminPanel'
  },
  {
    label: 'Manage Users',
    route: '/users',
    permission: 'manageUsers'
  },
  {
    label: 'Manage Roles',
    route: '/roles',
    permission: 'manageRoles'
  },
  {
    label: 'Reports',
    route: '/reports',
    permission: 'viewReports'
  },
  {
    label: 'Commission Settings',
    route: '/commission',
    permission: 'changeCommission'
  },
  {
    label: 'Audit Trail',
    route: '/audit',
    permission: 'viewAuditTrail'
  }
];
