import { apiClient } from './client';
import { TestingObjective, TestSession, TestOutcome, TestStatus } from '../types';

export interface BackendObjectiveRaw {
  id: string;
  title: string;
  description: string;
  target_area?: string;
  targetArea?: string;
  assigned_to?: string;
  assignedTo?: string;
  created_by?: string;
  createdBy?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_at?: string;
  updated_at?: string;
}

export function normalizeObjective(raw: BackendObjectiveRaw): TestingObjective {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    targetAppVersion: 'v2.4.0',
    targetAndroidVersions: ['Android 14', 'Android 15'],
    assignedBy: raw.createdBy || raw.created_by || 'Admin',
    assignedToTesterIds: raw.assignedTo || raw.assigned_to ? [raw.assignedTo || raw.assigned_to || ''] : [],
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

export interface BackendSubmissionRaw {
  id: string;
  session_id?: string;
  sessionId?: string;
  objective_id?: string;
  objectiveId?: string;
  objective_title?: string;
  tester_id?: string;
  testerId?: string;
  tester_name?: string;
  testerName?: string;
  device_id?: string;
  deviceId?: string;
  device_name?: string;
  deviceName?: string;
  device_model?: string;
  deviceModel?: string;
  scenario_name?: string;
  scenarioName?: string;
  description?: string;
  expected_result?: string;
  expectedResult?: string;
  actual_result?: string;
  actualResult?: string;
  outcome?: TestOutcome;
  tester_notes?: string;
  testerNotes?: string;
  status?: TestStatus;
  started_at?: string;
  created_at?: string;
  updated_at?: string;
}

export function normalizeSubmission(raw: BackendSubmissionRaw): TestSession {
  return {
    id: raw.id,
    objectiveId: raw.objectiveId || raw.objective_id || 'OBJ-501',
    objectiveTitle: raw.objective_title || raw.scenarioName || raw.scenario_name || 'Verification Test',
    deviceId: raw.deviceId || raw.device_id || 'DEV-101',
    deviceName: raw.deviceName || raw.device_name || 'Pixel 8 Pro',
    deviceModel: raw.deviceModel || raw.device_model || 'GC3VE',
    androidVersion: 'Android 14',
    appVersion: 'v2.4.0',
    testerId: raw.testerId || raw.tester_id || 'Tester',
    testerName: raw.testerName || raw.tester_name || 'Tester One',
    scenarioName: raw.scenarioName || raw.scenario_name || 'Call Detection Verification',
    description: raw.description || '',
    expectedResult: raw.expectedResult || raw.expected_result || '',
    actualResult: raw.actualResult || raw.actual_result || '',
    outcome: raw.outcome || 'PASS',
    status: raw.status || 'SUBMITTED',
    evidence: [],
    testerNotes: raw.testerNotes || raw.tester_notes,
    startedAt: raw.started_at || raw.created_at || new Date().toISOString(),
  };
}

export const testingApi = {
  async listObjectives(): Promise<TestingObjective[]> {
    const res = await apiClient<BackendObjectiveRaw[]>('/testing/objectives', { method: 'GET' });
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeObjective);
  },

  async createObjective(payload: {
    title: string;
    description: string;
    targetArea: string;
    assignedTo?: string;
  }): Promise<TestingObjective> {
    const res = await apiClient<BackendObjectiveRaw>('/testing/objectives', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeObjective(res.data);
  },

  async startSession(payload: {
    objectiveId: string;
    deviceId: string;
    appVersion: string;
    androidVersion: string;
  }): Promise<{ id: string }> {
    const res = await apiClient<{ id: string }>('/testing/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async listSubmissions(): Promise<TestSession[]> {
    const res = await apiClient<BackendSubmissionRaw[]>('/testing/submissions', { method: 'GET' });
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeSubmission);
  },

  async submitTest(payload: {
    sessionId: string;
    scenarioName: string;
    description: string;
    expectedResult: string;
    actualResult: string;
    outcome: TestOutcome;
    testerNotes?: string;
  }): Promise<TestSession> {
    const res = await apiClient<BackendSubmissionRaw>('/testing/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeSubmission(res.data);
  },

  async reviewSubmission(
    submissionId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_RETEST' | 'FEEDBACK',
    feedback: string
  ): Promise<any> {
    const res = await apiClient(`/testing/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, feedback }),
    });
    return res.data;
  },
};
