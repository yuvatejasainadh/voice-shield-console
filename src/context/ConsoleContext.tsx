import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Role,
  User,
  WorkItem,
  WorkStatus,
  DeveloperDocumentation,
  TestingObjective,
  TestSession,
  CompatibleDevice,
  RdsInstanceMetrics,
  DatabaseTableMeta,
  DatabaseUser,
  DatabaseMigration,
  DatabaseExportRecord,
  AuditEvent,
  ConsoleNotification,
} from '../types';
import {
  authApi,
  usersApi,
  workApi,
  documentationApi,
  devicesApi,
  testingApi,
  filesApi,
  databaseApi,
  exportsApi,
  auditApi,
  notificationsApi,
  healthApi,
  tokenStorage,
  ApiError,
} from '../api';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  actionName: string;
  resourceDetails: string;
  warningNote?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
}

interface ConsoleContextType {
  currentUser: User | null;
  currentRole: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  apiError: string | null;
  clearApiError: () => void;
  backendConnected: boolean;
  databaseReady: boolean;
  currentRoute: string;

  selectedWorkId: string | null;
  selectedTestId: string | null;
  selectedDocId: string | null;
  selectedDeviceId: string | null;
  selectedAuditEventId: string | null;

  users: User[];
  devices: CompatibleDevice[];
  workItems: WorkItem[];
  docs: DeveloperDocumentation[];
  objectives: TestingObjective[];
  testSessions: TestSession[];
  rdsMetrics: RdsInstanceMetrics | null;
  databaseTables: DatabaseTableMeta[];
  databaseRows: Record<string, Record<string, any>[]>;
  databaseUsers: DatabaseUser[];
  migrations: DatabaseMigration[];
  exports: DatabaseExportRecord[];
  auditEvents: AuditEvent[];
  notifications: ConsoleNotification[];

  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  confirmDialog: ConfirmDialogState | null;
  openConfirmDialog: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirmDialog: () => void;

  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  navigate: (
    route: string,
    params?: { workId?: string; testId?: string; docId?: string; deviceId?: string; auditId?: string }
  ) => void;
  refreshAllData: () => Promise<void>;

  createWorkItem: (item: Partial<WorkItem>) => Promise<void>;
  updateWorkStatus: (workId: string, status: WorkStatus) => Promise<void>;
  assignWorkItem: (workId: string, assigneeId: string) => Promise<void>;

  saveDoc: (doc: Partial<DeveloperDocumentation>, submit: boolean) => Promise<void>;
  reviewDoc: (
    docId: string,
    outcome: 'APPROVED' | 'CHANGES_REQUESTED',
    feedback: string,
    changeRequests?: string[]
  ) => Promise<void>;

  createTestingObjective: (obj: Partial<TestingObjective>) => Promise<void>;
  submitTestSession: (session: Partial<TestSession>) => Promise<string>;
  reviewTestSession: (
    testId: string,
    outcome: 'APPROVED' | 'REJECTED' | 'RE_TEST',
    comments: string
  ) => Promise<void>;

  addDevice: (device: Partial<CompatibleDevice>) => Promise<void>;
  deactivateDevice: (deviceId: string) => Promise<void>;
  activateDevice: (deviceId: string) => Promise<void>;

  generateExport: (format: 'SQL' | 'CSV' | 'JSON', tables: string[]) => Promise<void>;
  downloadExport: (exportId: string, format?: string) => Promise<void>;
  applyMigration: (migrationId: string) => Promise<void>;

  addDatabaseRow: (tableName: string, rowData: Record<string, any>) => Promise<void>;
  updateDatabaseRow: (
    tableName: string,
    pkField: string,
    pkValue: string,
    rowData: Record<string, any>
  ) => Promise<void>;
  deleteDatabaseRow: (tableName: string, pkField: string, pkValue: string) => Promise<void>;

  addDatabaseUser: (user: { username: string; role: string }) => Promise<void>;
  toggleDatabaseUserStatus: (userId: string) => Promise<void>;

  addTeamUser: (user: { name: string; email: string; role: Role }) => Promise<void>;
  updateTeamUserRole: (userId: string, newRole: Role) => Promise<void>;
  toggleTeamUserStatus: (userId: string) => Promise<void>;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  recordAuditEvent: (
    action: string,
    resource: string,
    resourceId: string,
    details: AuditEvent['details']
  ) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const ConsoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [databaseReady, setDatabaseReady] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>('overview');

  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedAuditEventId, setSelectedAuditEventId] = useState<string | null>(null);

  // Real backend entities
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<CompatibleDevice[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [docs, setDocs] = useState<DeveloperDocumentation[]>([]);
  const [objectives, setObjectives] = useState<TestingObjective[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [rdsMetrics, setRdsMetrics] = useState<RdsInstanceMetrics | null>(null);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTableMeta[]>([]);
  const [databaseRows, setDatabaseRows] = useState<Record<string, Record<string, any>[]>>({});
  const [databaseUsers, setDatabaseUsers] = useState<DatabaseUser[]>([]);
  const [migrations, setMigrations] = useState<DatabaseMigration[]>([]);
  const [exportsList, setExportsList] = useState<DatabaseExportRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [notifications, setNotifications] = useState<ConsoleNotification[]>([]);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const currentRole: Role = currentUser?.role || 'SUPER_ADMIN';

  const clearApiError = () => setApiError(null);

  // Global session expiration handler
  useEffect(() => {
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setApiError('Session expired. Please sign in again.');
    };
    window.addEventListener('vs-session-expired', handleSessionExpired);
    return () => window.removeEventListener('vs-session-expired', handleSessionExpired);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openConfirmDialog = (dialog: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...dialog, isOpen: true });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // Refresh all authorized data from backend
  const refreshAllData = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) return;

    try {
      // 1. Health check
      healthApi.getReady().then((health) => {
        setBackendConnected(health.status === 'READY');
        setDatabaseReady(health.checks?.database === 'CONNECTED');
      }).catch(() => {
        setBackendConnected(false);
      });

      // 2. Fetch primary domains concurrently
      const [
        workRes,
        devicesRes,
        objRes,
        subsRes,
        notifsRes,
      ] = await Promise.allSettled([
        workApi.listWork(),
        devicesApi.listDevices(),
        testingApi.listObjectives(),
        testingApi.listSubmissions(),
        notificationsApi.listNotifications(),
      ]);

      if (workRes.status === 'fulfilled') setWorkItems(workRes.value.workItems);
      if (devicesRes.status === 'fulfilled') setDevices(devicesRes.value);
      if (objRes.status === 'fulfilled') setObjectives(objRes.value);
      if (subsRes.status === 'fulfilled') setTestSessions(subsRes.value);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value);

      // 3. Privileged endpoints for SUPER_ADMIN and ADMIN
      const [
        usersRes,
        dbStatusRes,
        tablesRes,
        dbUsersRes,
        migrationsRes,
        exportsRes,
        auditRes,
      ] = await Promise.allSettled([
        usersApi.listUsers(),
        databaseApi.getStatus(),
        databaseApi.getTables(),
        databaseApi.getUsers(),
        databaseApi.getMigrations(),
        exportsApi.listExports(),
        auditApi.listAuditLogs(),
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users);
      if (dbStatusRes.status === 'fulfilled') setRdsMetrics(dbStatusRes.value);
      if (dbUsersRes.status === 'fulfilled') setDatabaseUsers(dbUsersRes.value);
      if (migrationsRes.status === 'fulfilled') setMigrations(migrationsRes.value);
      if (exportsRes.status === 'fulfilled') setExportsList(exportsRes.value);
      if (auditRes.status === 'fulfilled') setAuditEvents(auditRes.value.events);

      // If tables list returned, populate table metadata and initial row previews
      if (tablesRes.status === 'fulfilled' && tablesRes.value.length > 0) {
        const tableNames = tablesRes.value;
        const metas: DatabaseTableMeta[] = [];
        for (const tbl of tableNames.slice(0, 10)) {
          try {
            const meta = await databaseApi.getTableInfo(tbl);
            metas.push(meta);
          } catch {
            metas.push({ name: tbl, rowCount: 0, sizeBytes: '0 KB', columns: [] });
          }
        }
        setDatabaseTables(metas);

        // Fetch sample rows for first table
        if (metas.length > 0) {
          try {
            const rows = await databaseApi.getTableRows(metas[0].name, { limit: 25 });
            setDatabaseRows((prev) => ({ ...prev, [metas[0].name]: rows }));
          } catch {
            // Ignore if restricted
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to refresh console data from backend:', err);
      setApiError(err.message || 'Error communicating with backend service');
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      const token = tokenStorage.getAccessToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const meRes = await authApi.getMe();
        if (meRes?.user) {
          const userObj: User = {
            id: meRes.user.id,
            name: meRes.user.name || (meRes.user as any).displayName || meRes.user.email?.split('@')[0] || 'User',
            email: meRes.user.email,
            role: meRes.user.role,
            status: meRes.user.status || 'ACTIVE',
            lastActive: new Date().toISOString(),
            createdAt: meRes.user.createdAt || new Date().toISOString(),
            permissions: meRes.user.permissions || [],
          };
          setCurrentUser(userObj);
          setIsAuthenticated(true);
          await refreshAllData();
        } else {
          tokenStorage.clearTokens();
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.warn('Authentication verification failed:', err);
        tokenStorage.clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [refreshAllData]);

  // Login handler
  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    setApiError(null);
    localStorage.removeItem('vs_console_logged_out');
    try {
      const data = await authApi.login(email, password || '');
      const userObj: User = {
        id: data.user.id,
        name: data.user.displayName || data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.role,
        status: data.user.status === 'DISABLED' ? 'INACTIVE' : 'ACTIVE',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        permissions: [],
      };
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      setCurrentRoute('overview');
      await refreshAllData();
      return true;
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err.message || 'Login failed';
      setApiError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    localStorage.setItem('vs_console_logged_out', 'true');
    try {
      await authApi.logout();
    } catch {
      // Backend logout may fail, but the frontend session should still be cleared.
    }
    tokenStorage.clearTokens();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentRoute('overview');
  };

  // Switch to an existing backend user when authorized access is available.
  const switchUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    if (['database', 'exports'].includes(currentRoute) && !['SUPER_ADMIN', 'ADMIN'].includes(target.role)) {
      setCurrentRoute('overview');
    } else if (currentRoute === 'team' && target.role !== 'SUPER_ADMIN') {
      setCurrentRoute('overview');
    } else if (currentRoute === 'devices' && !['SUPER_ADMIN', 'ADMIN'].includes(target.role)) {
      setCurrentRoute('overview');
    }
  };

  // Navigation with RBAC checks
  const navigate = (
    route: string,
    params?: { workId?: string; testId?: string; docId?: string; deviceId?: string; auditId?: string }
  ) => {
    if (['database', 'exports'].includes(route) && !['SUPER_ADMIN', 'ADMIN'].includes(currentRole)) {
      setCurrentRoute('overview');
      return;
    }
    if (route === 'team' && currentRole !== 'SUPER_ADMIN') {
      setCurrentRoute('overview');
      return;
    }
    if (route === 'devices' && !['SUPER_ADMIN', 'ADMIN'].includes(currentRole)) {
      setCurrentRoute('overview');
      return;
    }
    if (params?.workId) setSelectedWorkId(params.workId);
    if (params?.testId) setSelectedTestId(params.testId);
    if (params?.docId) setSelectedDocId(params.docId);
    if (params?.deviceId) setSelectedDeviceId(params.deviceId);
    if (params?.auditId) setSelectedAuditEventId(params.auditId);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Work Management Operations
  const createWorkItem = async (item: Partial<WorkItem>) => {
    try {
      const created = await workApi.createWork({
        title: item.title || 'Untitled Work Item',
        description: item.description || '',
        priority: item.priority || 'MEDIUM',
        assignedTo: item.assigneeId || users.find((u) => u.role === 'DEVELOPER')?.id || currentUser?.id || '',
      });
      setWorkItems((prev) => [created, ...prev]);
      await refreshAllData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to create work item');
      throw err;
    }
  };

  const updateWorkStatus = async (workId: string, status: WorkStatus) => {
    try {
      if (status === 'ACCEPTED') {
        await workApi.acceptWork(workId);
      } else if (status === 'IN_PROGRESS') {
        await workApi.startWork(workId);
      } else if (status === 'COMPLETED') {
        await workApi.completeWork(workId);
      } else {
        await workApi.updateWork(workId, { status });
      }
      setWorkItems((prev) =>
        prev.map((w) => (w.id === workId ? { ...w, status, updatedAt: new Date().toISOString() } : w))
      );
    } catch (err: any) {
      setApiError(err.message || 'Failed to update work status');
      throw err;
    }
  };

  const assignWorkItem = async (workId: string, assigneeId: string) => {
    try {
      await workApi.updateWork(workId, { assignedTo: assigneeId });
      const targetUser = users.find((u) => u.id === assigneeId);
      setWorkItems((prev) =>
        prev.map((w) =>
          w.id === workId
            ? {
                ...w,
                assigneeId,
                assigneeName: targetUser?.name || assigneeId,
                updatedAt: new Date().toISOString(),
              }
            : w
        )
      );
    } catch (err: any) {
      setApiError(err.message || 'Failed to assign work item');
      throw err;
    }
  };

  // Documentation Operations
  const saveDoc = async (docData: Partial<DeveloperDocumentation>, submit: boolean) => {
    try {
      const workId = docData.workId || selectedWorkId;
      if (!workId) throw new Error('Work item ID is required to save documentation');

      const createdDoc = await workApi.createWorkDoc(workId, {
        what_i_did: docData.whatIDid || 'Engineering task implementation',
        why_i_did_it: docData.whyIDidIt || 'Platform optimization and verification',
        changes_made: docData.changesMade || 'Code and architecture alterations',
        testing_performed: docData.testingPerformed || 'On-device manual test and logs',
        result: docData.result || 'Functional and verified',
        files_affected: docData.affectedComponents || [],
        problems_encountered: docData.problemsEncountered,
        solution: docData.solutionApproach,
        next_steps: docData.nextSteps,
        references: docData.references ? Object.values(docData.references).filter(Boolean) : [],
      });

      if (submit && createdDoc?.id) {
        await documentationApi.submitDoc(createdDoc.id);
      }

      await refreshAllData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to save documentation');
      throw err;
    }
  };

  const reviewDoc = async (
    docId: string,
    outcome: 'APPROVED' | 'CHANGES_REQUESTED',
    feedback: string
  ) => {
    try {
      const action = outcome === 'APPROVED' ? 'APPROVE' : 'REQUEST_CHANGES';
      await documentationApi.reviewDoc(docId, action, feedback);
      await refreshAllData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit documentation review');
      throw err;
    }
  };

  // Testing Operations
  const createTestingObjective = async (obj: Partial<TestingObjective>) => {
    try {
      const created = await testingApi.createObjective({
        title: obj.title || 'Testing Objective',
        description: obj.description || '',
        targetArea: 'Real-Time Audio Stream Analysis',
        assignedTo: obj.assignedToTesterIds?.[0],
      });
      setObjectives((prev) => [created, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create testing objective');
      throw err;
    }
  };

  const submitTestSession = async (session: Partial<TestSession>): Promise<string> => {
    try {
      // 1. Start Quick Test session on backend
      const { id: sessionId } = await testingApi.startSession({
        objectiveId: session.objectiveId || objectives[0]?.id || 'o1111111-1111-4111-a111-111111111111',
        deviceId: session.deviceId || devices[0]?.id || 'd1111111-1111-4111-a111-111111111111',
        appVersion: session.appVersion || 'v2.4.0',
        androidVersion: session.androidVersion || 'Android 14',
      });

      // 2. Submit test outcome and results
      const submission = await testingApi.submitTest({
        sessionId,
        scenarioName: session.scenarioName || 'Call Detection Verification',
        description: session.description || 'Execution under calibrated audio input',
        expectedResult: session.expectedResult || 'HUD overlay triggers promptly',
        actualResult: session.actualResult || 'HUD overlay confirmed in 2.9s',
        outcome: session.outcome || 'PASS',
        testerNotes: session.testerNotes,
      });

      // 3. Upload attached files if present
      if (session.evidence && session.evidence.length > 0) {
        for (const ev of session.evidence) {
          if (ev.file) {
            try {
              await filesApi.uploadFile(ev.file, submission.id);
            } catch (fileErr) {
              console.warn('Failed to upload evidence file:', fileErr);
            }
          }
        }
      }

      setTestSessions((prev) => [submission, ...prev]);
      return submission.id;
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit test session');
      throw err;
    }
  };

  const reviewTestSession = async (
    testId: string,
    outcome: 'APPROVED' | 'REJECTED' | 'RE_TEST',
    comments: string
  ) => {
    try {
      const action =
        outcome === 'APPROVED' ? 'APPROVE' : outcome === 'RE_TEST' ? 'REQUEST_RETEST' : 'REJECT';
      await testingApi.reviewSubmission(testId, action, comments);
      await refreshAllData();
    } catch (err: any) {
      setApiError(err.message || 'Failed to review test submission');
      throw err;
    }
  };

  // Compatible Devices
  const addDevice = async (device: Partial<CompatibleDevice>) => {
    try {
      const created = await devicesApi.createDevice({
        deviceName: device.name || 'Android Device',
        modelNumber: device.modelNumber || 'SM-A546B',
        manufacturer: device.manufacturer || 'Samsung',
        androidVersion: device.androidVersion || 'Android 14',
      });
      setDevices((prev) => [created, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to register device');
      throw err;
    }
  };

  const deactivateDevice = async (deviceId: string) => {
    try {
      const updated = await devicesApi.deactivateDevice(deviceId);
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? updated : d)));
    } catch (err: any) {
      setApiError(err.message || 'Failed to deactivate device');
      throw err;
    }
  };

  const activateDevice = async (deviceId: string) => {
    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: 'ACTIVE' } : d)));
  };

  // Database RDS Operations
  const addDatabaseRow = async (tableName: string, rowData: Record<string, any>) => {
    try {
      await databaseApi.insertTableRow(tableName, rowData);
      const rows = await databaseApi.getTableRows(tableName);
      setDatabaseRows((prev) => ({ ...prev, [tableName]: rows }));
    } catch (err: any) {
      setApiError(err.message || 'Failed to insert database row');
      throw err;
    }
  };

  const updateDatabaseRow = async (
    tableName: string,
    _pkField: string,
    pkValue: string,
    rowData: Record<string, any>
  ) => {
    try {
      await databaseApi.updateTableRow(tableName, pkValue, rowData);
      const rows = await databaseApi.getTableRows(tableName);
      setDatabaseRows((prev) => ({ ...prev, [tableName]: rows }));
    } catch (err: any) {
      setApiError(err.message || 'Failed to update database row');
      throw err;
    }
  };

  const deleteDatabaseRow = async (tableName: string, _pkField: string, pkValue: string) => {
    try {
      await databaseApi.deleteTableRow(tableName, pkValue);
      const rows = await databaseApi.getTableRows(tableName);
      setDatabaseRows((prev) => ({ ...prev, [tableName]: rows }));
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete database row');
      throw err;
    }
  };

  const addDatabaseUser = async (user: { username: string; role: string }) => {
    try {
      await databaseApi.createUser(user);
      const dbUsers = await databaseApi.getUsers();
      setDatabaseUsers(dbUsers);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create database user');
      throw err;
    }
  };

  const toggleDatabaseUserStatus = async (userId: string) => {
    try {
      await databaseApi.disableUser(userId);
      const dbUsers = await databaseApi.getUsers();
      setDatabaseUsers(dbUsers);
    } catch (err: any) {
      setApiError(err.message || 'Failed to update database user status');
      throw err;
    }
  };

  const applyMigration = async (migrationId: string) => {
    try {
      await databaseApi.applyMigration(migrationId);
      const migs = await databaseApi.getMigrations();
      setMigrations(migs);
    } catch (err: any) {
      setApiError(err.message || 'Failed to apply schema migration');
      throw err;
    }
  };

  // Exports
  const generateExport = async (format: 'SQL' | 'CSV' | 'JSON', tables: string[]) => {
    try {
      const exp = await exportsApi.createExport({ format, tables });
      setExportsList((prev) => [exp, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to generate database export');
      throw err;
    }
  };

  const downloadExport = async (exportId: string, format = 'sql') => {
    try {
      await exportsApi.downloadExport(exportId, format);
    } catch (err: any) {
      setApiError(err.message || 'Failed to download export');
      throw err;
    }
  };

  // Team Management
  const addTeamUser = async (user: { name: string; email: string; role: Role }) => {
    try {
      const created = await usersApi.createUser({
        email: user.email,
        displayName: user.name,
        role: user.role,
        password: `${user.name.replace(/\s+/g, '').slice(0, 8)}!TempPass${Date.now().toString().slice(-6)}`,
      });
      setUsers((prev) => [created, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to provision team user');
      throw err;
    }
  };

  const updateTeamUserRole = async (userId: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const toggleTeamUserStatus = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      )
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    notificationsApi.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    notificationsApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const recordAuditEvent = (
    action: string,
    resource: string,
    resourceId: string,
    details: AuditEvent['details']
  ) => {
    const newEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'system',
      actorName: currentUser?.name || 'Sainadh',
      actorRole: currentUser?.role || 'SUPER_ADMIN',
      action,
      resource,
      resourceId,
      result: 'SUCCESS',
      ipAddress: 'unknown',
      userAgent: 'VoiceShield-Console',
      details,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <ConsoleContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isLoading,
        apiError,
        clearApiError,
        backendConnected,
        databaseReady,
        currentRoute,

        selectedWorkId,
        selectedTestId,
        selectedDocId,
        selectedDeviceId,
        selectedAuditEventId,

        users,
        devices,
        workItems,
        docs,
        objectives,
        testSessions,
        rdsMetrics,
        databaseTables,
        databaseRows,
        databaseUsers,
        migrations,
        exports: exportsList,
        auditEvents,
        notifications,

        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        confirmDialog,
        openConfirmDialog,
        closeConfirmDialog,

        login,
        logout,
        switchUser,
        navigate,
        refreshAllData,

        createWorkItem,
        updateWorkStatus,
        assignWorkItem,

        saveDoc,
        reviewDoc,

        createTestingObjective,
        submitTestSession,
        reviewTestSession,

        addDevice,
        deactivateDevice,
        activateDevice,

        generateExport,
        downloadExport,
        applyMigration,

        addDatabaseRow,
        updateDatabaseRow,
        deleteDatabaseRow,

        addDatabaseUser,
        toggleDatabaseUserStatus,

        addTeamUser,
        updateTeamUserRole,
        toggleTeamUserStatus,

        markNotificationRead,
        markAllNotificationsRead,
        recordAuditEvent,
      }}
    >
      {children}
    </ConsoleContext.Provider>
  );
};

export const useConsole = (): ConsoleContextType => {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
};
