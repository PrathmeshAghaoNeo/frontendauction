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
    label: 'Manage Assets',
    route: '/assets',
    permission: 'manageAssets'
  },
  {
    label: 'Manage Auctions',
    route: '/auctions',
    permission: 'manageAuctions'
  },
  {
    label: 'Manage Requests',
    route: '/requests',
    permission: 'manageRequests'
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
    label: 'Manage Transactions',
    route: '/transactions',
    permission: 'changeCommission'
  },
  {
    label: 'Audit Trail',
    route: '/audit-trial',
    permission: 'viewAuditTrail'
  },
  // {
  //   label: 'Audit Trail',
  //   route: '/audit-trial',
  //   permission: 'viewAuditTrail'
  // },
  // {
  //   label: 'Audit Trail',
  //   route: '/audit-trial',
  //   permission: 'viewAuditTrail'
  // }
];
