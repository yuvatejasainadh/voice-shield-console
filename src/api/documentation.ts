import { apiClient } from './client';
import { DeveloperDocumentation } from '../types';

export interface BackendDocRaw {
  id: string;
  work_id?: string;
  workId?: string;
  author_id?: string;
  authorId?: string;
  author_name?: string;
  authorName?: string;
  what_i_did?: string;
  whatIDid?: string;
  why_i_did_it?: string;
  whyIDidIt?: string;
  changes_made?: string;
  changesMade?: string;
  files_affected?: string[];
  filesAffected?: string[];
  problems_encountered?: string;
  problemsEncountered?: string;
  solution?: string;
  solutionApproach?: string;
  testing_performed?: string;
  testingPerformed?: string;
  result?: string;
  next_steps?: string;
  nextSteps?: string;
  references?: string[];
  status?: DeveloperDocumentation['status'];
  version?: number;
  submitted_at?: string;
  submittedAt?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  review_feedback?: string;
  reviewFeedback?: string;
}

export function normalizeDoc(raw: BackendDocRaw, workTitle = 'Engineering Task'): DeveloperDocumentation {
  const refs = raw.references || [];
  return {
    id: raw.id,
    workId: raw.workId || raw.work_id || '',
    workTitle,
    authorId: raw.authorId || raw.author_id || '',
    authorName: raw.authorName || raw.author_name || 'Developer',
    version: raw.version || 1,
    status: raw.status || 'DRAFT',
    whatIDid: raw.whatIDid || raw.what_i_did || '',
    whyIDidIt: raw.whyIDidIt || raw.why_i_did_it || '',
    changesMade: raw.changesMade || raw.changes_made || '',
    affectedComponents: raw.filesAffected || raw.files_affected || [],
    problemsEncountered: raw.problemsEncountered || raw.problems_encountered || '',
    solutionApproach: raw.solutionApproach || raw.solution || '',
    testingPerformed: raw.testingPerformed || raw.testing_performed || '',
    result: raw.result || '',
    nextSteps: raw.nextSteps || raw.next_steps || '',
    references: {
      prNumber: refs.find((r) => r.startsWith('#')) || '#',
      commitHash: refs.find((r) => r.length === 7 || r.length === 40) || '',
      issueId: refs.find((r) => r.startsWith('VS-') || r.startsWith('ISSUE-')) || '',
      deploymentId: refs.find((r) => r.startsWith('dep-')) || '',
      relatedTestId: refs.find((r) => r.startsWith('TS-')) || '',
    },
    reviewFeedback: raw.reviewFeedback || raw.review_feedback,
    submittedAt: raw.submittedAt || raw.submitted_at || raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

export const documentationApi = {
  async submitDoc(id: string): Promise<any> {
    const res = await apiClient(`/documentation/${id}/submit`, { method: 'POST' });
    return res.data;
  },

  async reviewDoc(id: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'FEEDBACK', feedback: string): Promise<any> {
    const res = await apiClient(`/documentation/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, feedback }),
    });
    return res.data;
  },
};
