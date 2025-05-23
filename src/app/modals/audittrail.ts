export interface AuditTrail {
  auditId: number;
  userId: number;
  roleId: number;
  activityPerformedAt: string;
  createdBy: string;
  modelName: string;
  changeType: string; // e.g., "Update", "Create", "Delete"
  recordId: number;

  beforeChange: string; // JSON string to be parsed into Auction object
  afterChange: string;  // JSON string to be parsed into Auction object
}
