export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DEVELOPER' | 'TESTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  lastActive: string;
  createdAt: string;
  permissions?: string[];
}

export type WorkStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'DOCUMENTATION_SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'COMPLETED';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: 'FEATURE' | 'SECURITY' | 'INFRASTRUCTURE' | 'BUG_FIX' | 'OPTIMIZATION';
  priority: Priority;
  status: WorkStatus;
  assigneeId: string;
  assigneeName: string;
  assigneeRole: Role;
  assignedById: string;
  assignedByName: string;
  assignedByRole?: Role;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  relatedTestIds?: string[];
  docId?: string;
}

export interface DeveloperDocumentation {
  id: string;
  workId: string;
  workTitle: string;
  authorId: string;
  authorName: string;
  version: number;
  submittedAt: string;
  status: 'DRAFT' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED';
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewFeedback?: string;
  changeRequests?: string[];
  whatIDid: string;
  whyIDidIt: string;
  changesMade: string;
  affectedComponents: string[];
  problemsEncountered: string;
  solutionApproach: string;
  testingPerformed: string;
  result: string;
  nextSteps: string;
  references: {
    prNumber?: string;
    commitHash?: string;
    issueId?: string;
    deploymentId?: string;
    relatedTestId?: string;
  };
  updatedAt?: string;
}

export type TestOutcome = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_TESTED';

export type TestStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'RE_TEST_REQUIRED'
  | 'CLOSED';

export interface TestingObjective {
  id: string;
  title: string;
  description: string;
  targetAppVersion: string;
  targetAndroidVersions: string[];
  assignedToTesterIds: string[];
  assignedBy: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface TestEvidence {
  id: string;
  name: string;
  type: 'SCREENSHOT' | 'LOG' | 'RECORDING';
  size: string;
  timestamp: string;
  url?: string;
  snippet?: string;
  file?: File;
}

export interface TestSession {
  id: string;
  objectiveId: string;
  objectiveTitle: string;
  testerId: string;
  testerName: string;
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  androidVersion: string;
  appVersion: string;
  startedAt: string;
  completedAt?: string;
  status: TestStatus;
  scenarioName: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  outcome: TestOutcome;
  evidence: TestEvidence[];
  testerNotes?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewOutcome?: 'APPROVED' | 'REJECTED' | 'RE_TEST';
  reviewComments?: string;
}

export interface CompatibleDevice {
  id: string;
  name: string;
  modelNumber: string;
  manufacturer: string;
  androidVersion: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastUpdated?: string;
  registeredAt?: string;
  chipset: string;
  testingHistoryCount?: number;
}

export interface RdsInstanceMetrics {
  engine: string;
  engineVersion: string;
  status: string;
  databaseName: string;
  region: string;
  allocatedStorageGb: number;
  usedStorageGb: number;
  storageType: string;
  activeConnections: number;
  maxConnections: number;
  endpoint: string;
  port: number;
  cpuUtilizationPercent?: number;
  freeableMemoryMb?: number;
  multiAz?: boolean;
  autoMinorVersionUpgrade?: boolean;
  backupRetentionDays?: number;
  lastBackupTime?: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  defaultValue?: string;
}

export interface DatabaseTableMeta {
  name: string;
  schema?: string;
  rowCount: number;
  sizeBytes: string;
  columns: DatabaseColumn[];
}

export interface DatabaseUser {
  id: string;
  username: string;
  role: string;
  permissions: string[];
  status: 'ACTIVE' | 'DISABLED';
  lastActivity: string;
}

export interface DatabaseMigration {
  id: string;
  name?: string;
  version: string;
  description: string;
  appliedAt: string;
  appliedBy?: string;
  status: 'APPLIED' | 'PENDING' | 'ROLLED_BACK';
  checksum?: string;
}

export interface DatabaseExportRecord {
  id: string;
  requestedBy: string;
  requestedByName: string;
  format: 'SQL' | 'CSV' | 'JSON';
  targetDatabase?: string;
  targetSchema?: string;
  tables: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileSize: string;
  checksumSha256: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  ipAddress: string;
  userAgent: string;
  details: {
    summary: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
    payload?: Record<string, any>;
  };
}

export interface ConsoleNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  targetRoute?: string;
}
