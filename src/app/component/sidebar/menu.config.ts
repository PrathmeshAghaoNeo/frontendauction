import { PermissionKey } from "../../modals/roles";

export interface MenuItem {
  label: string;
  route: string;
  permission: PermissionKey;
  icon: string;
}

export const MENU_CONFIG: MenuItem[] = [

  {
    label: 'Dashboard',
    route: '/dashboard',
    permission: 'accessAdminPanel',
    icon: 'fas fa-home'
  },
  {
    label: 'Manage Auctions',
    route: '/auctions',
    permission: 'manageAuctions',
    icon: 'fas fa-gavel'
  },
  {
    label: 'Manage Users',
    route: '/users',
    permission: 'manageUsers',
    icon: 'fas fa-users-cog'
  },
  {
    label: 'Manage Assets',
    route: '/assets',
    permission: 'manageAssets',
    icon: 'fas fa-cubes'
  },

  {
    label: 'Manage Requests',
    route: '/requests',
    permission: 'manageRequests',
    icon: 'fas fa-envelope-open-text'
  },
  {
    label: 'Manage Roles',
    route: '/roles',
    permission: 'manageRoles',
    icon: 'fas fa-user-shield'
  },
  {
    label: 'Reports',
    route: '/reports',
    permission: 'viewReports',
    icon: 'fas fa-chart-bar'

  },
  {
    label: 'Manage Transactions',
    route: '/transactions',
    permission: 'changeCommission',
    icon: 'fas fa-exchange-alt'


  },
  {
    label: 'Audit Trail',
    route: '/audit-trial',
    permission: 'viewAuditTrail',
    icon: 'fas fa-history'
  },
  {
    label: 'Asset-Categories',
    route: '/assetcategories',
    permission: 'manageAssets',
    icon: 'fas fa-tags'
  },
  {
    label: 'Settings',
    route: '/settings',
    permission: 'viewAuditTrail',
    icon: 'fas fa-cog'

  },
  
  {
    label: 'Manage Chat-Bot',
    route: '/chatbot-admin',
    permission: 'viewAuditTrail',
    icon: 'fas fa-robot'

  }
];
