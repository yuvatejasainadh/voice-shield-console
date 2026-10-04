import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  History,
  GitPullRequest,
  GitCommit,
  FlaskConical,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { DeveloperDocumentation, TestSession } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const DocReviewView: React.FC = () => {
  const {
    currentUser,
    docs,
    testSessions,
    selectedDocId,
    selectedTestId,
    reviewDoc,
    reviewTestSession,
  } = useConsole();

  const [activeTab, setActiveTab] = useState<'DOCS' | 'TESTS'>(
    selectedTestId ? 'TESTS' : 'DOCS'
  );

  const [activeDocId, setActiveDocId] = useState<string>(
    selectedDocId || docs.find((d) => d.status === 'SUBMITTED')?.id || docs[0]?.id || ''
  );

  const [activeTestId, setActiveTestId] = useState<string>(
    selectedTestId || testSessions.find((t) => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED')?.id || testSessions[0]?.id || ''
  );

  const [feedback, setFeedback] = useState('');
  const [changeReqInput, setChangeReqInput] = useState('');
  const [changeRequests, setChangeRequests] = useState<string[]>([]);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const activeDoc = docs.find((d) => d.id === activeDocId);
  const activeTest = testSessions.find((t) => t.id === activeTestId);

  const handleAddChangeReq = () => {
    if (changeReqInput.trim()) {
      setChangeRequests([...changeRequests, changeReqInput.trim()]);
      setChangeReqInput('');
    }
  };

  const handleRemoveChangeReq = (index: number) => {
    setChangeRequests(changeRequests.filter((_, idx) => idx !== index));
  };

  const handleDocDecision = (outcome: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!activeDoc) return;
    reviewDoc(
      activeDoc.id,
      outcome,
      feedback || (outcome === 'APPROVED' ? 'Documentation verified and approved.' : 'Changes requested.'),
      changeRequests
    );
    setReviewSuccess(`Documentation ${activeDoc.id} marked as ${outcome}.`);
    setFeedback('');
    setChangeRequests([]);
    setTimeout(() => setReviewSuccess(null), 3500);
  };

  const handleTestDecision = (outcome: 'APPROVED' | 'REJECTED' | 'RE_TEST') => {
    if (!activeTest) return;
    reviewTestSession(
      activeTest.id,
      outcome,
      feedback || `Test outcome evaluated as ${outcome}.`
    );
    setReviewSuccess(`Test session ${activeTest.id} evaluated as ${outcome}.`);
    setFeedback('');
    setTimeout(() => setReviewSuccess(null), 3500);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / REVIEW QUEUE
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Review Queue
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Technical sign-off for Developer engineering documentation and Tester manual verification.
          </p>
        </div>

        {/* Minimal Tab Switch */}
        <div className="flex items-center p-1 bg-[#101216] border border-[#252930] rounded-[4px] text-xs">
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer ${
              activeTab === 'DOCS'
                ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
            }`}
          >
            Developer Docs ({docs.filter((d) => d.status === 'SUBMITTED').length})
          </button>
          <button
            onClick={() => setActiveTab('TESTS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer ${
              activeTab === 'TESTS'
                ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
            }`}
          >
            Tester Runs ({testSessions.filter((t) => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length})
          </button>
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-3 rounded-[4px] bg-[#101216] border border-[#252930] text-[#81C995] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 1: DEVELOPER DOCS REVIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'DOCS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#252930] rounded-[4px] overflow-hidden bg-[#0A0B0D]">
          {/* Submissions List Sidebar (3 cols) */}
          <div className="lg:col-span-3 border-r border-[#252930] bg-[#090A0C] divide-y divide-[#1F232B] overflow-y-auto max-h-[750px]">
            <div className="p-3 text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6] bg-[#0B0C0E]">
              Submissions ({docs.length})
            </div>
            {docs.map((doc) => {
              const isSelected = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#15181D] border-l-2 border-[#8AB4F8]' : 'hover:bg-[#101216]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#8AB4F8] font-medium">{doc.id}</span>
                    <StatusBadge status={doc.status} size="sm" />
                  </div>
                  <div className="text-xs font-medium text-[#F1F3F4] line-clamp-1 mb-1">
                    {doc.workTitle}
                  </div>
                  <div className="text-[11px] text-[#6F757D] font-mono flex items-center justify-between">
                    <span>{doc.authorName}</span>
                    <span>v{doc.version}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Document Content (6 cols) */}
          <div className="lg:col-span-6 p-6 space-y-5 text-xs overflow-y-auto max-h-[750px] border-r border-[#252930]">
            {activeDoc ? (
              <>
                <div className="border-b border-[#252930] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8AB4F8]">{activeDoc.workId}</span>
                    <StatusBadge status={activeDoc.status} />
                  </div>
                  <h2 className="text-base font-semibold text-[#F1F3F4] mt-1">
                    {activeDoc.workTitle}
                  </h2>
                  <div className="text-[11px] text-[#9AA0A6] font-mono mt-1">
                    Author: {activeDoc.authorName} · Submitted: {new Date(activeDoc.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      What I Did
                    </div>
                    <p className="text-[#F1F3F4] leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                      {activeDoc.whatIDid}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Why I Did It
                    </div>
                    <p className="text-[#F1F3F4] leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                      {activeDoc.whyIDidIt}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Changes Made
                    </div>
                    <p className="text-[#F1F3F4] leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930] whitespace-pre-line">
                      {activeDoc.changesMade}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Affected Components
                    </div>
                    <div className="bg-[#101216] p-3 rounded-[4px] border border-[#252930] font-mono text-[11px] text-[#8AB4F8] space-y-1">
                      {activeDoc.affectedComponents.map((c) => (
                        <div key={c} className="truncate">• {c}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Testing Performed & Outcome
                    </div>
                    <div className="p-3 bg-[#101216] border border-[#252930] rounded-[4px] space-y-2">
                      <p className="text-[#F1F3F4] leading-relaxed">{activeDoc.testingPerformed}</p>
                      <div className="text-[#81C995] font-mono text-[11px] pt-1 border-t border-[#252930]">
                        Outcome: {activeDoc.result}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-[#6F757D]">
                Select a document to review.
              </div>
            )}
          </div>

          {/* Right Review Pane (3 cols) */}
          <div className="lg:col-span-3 p-5 bg-[#090A0C] flex flex-col justify-between text-xs space-y-4">
            <div className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6] pb-2 border-b border-[#252930]">
                Review Decision
              </div>

              <div>
                <span className="text-[#6F757D] text-[11px] block font-mono uppercase mb-1">
                  Active Reviewer
                </span>
                <div className="text-[#F1F3F4] font-medium font-mono">
                  {currentUser ? `${currentUser.name} (${currentUser.role.replace('_', ' ')})` : 'Authorized Reviewer'}
                </div>
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Feedback
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide technical critique or approval comments..."
                  className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-2.5 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Change Requests
                </label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={changeReqInput}
                    onChange={(e) => setChangeReqInput(e.target.value)}
                    placeholder="e.g. Include P99 latency histogram"
                    className="flex-1 bg-[#101216] border border-[#252930] rounded-[4px] px-2 py-1 text-[#F1F3F4]"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChangeReq())}
                  />
                  <button
                    onClick={handleAddChangeReq}
                    type="button"
                    className="px-2.5 py-1 bg-[#15181D] hover:bg-[#1A1D22] border border-[#252930] text-[#F1F3F4] rounded-[4px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {changeRequests.length > 0 && (
                  <div className="space-y-1">
                    {changeRequests.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#15181D] border border-[#252930] text-[11px] text-[#FDD663]"
                      >
                        <span className="truncate">{req}</span>
                        <button
                          onClick={() => handleRemoveChangeReq(idx)}
                          className="text-[#6F757D] hover:text-[#F1F3F4]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#252930]">
              <button
                onClick={() => handleDocDecision('APPROVED')}
                className="w-full py-2 bg-[#81C995] hover:bg-[#A8E5BA] text-[#0B0C0E] font-medium text-xs rounded-[4px] transition-colors cursor-pointer"
              >
                Approve Documentation
              </button>
              <button
                onClick={() => handleDocDecision('CHANGES_REQUESTED')}
                className="w-full py-2 bg-transparent hover:bg-[#15181D] border border-[#30343A] text-[#FDD663] text-xs rounded-[4px] transition-colors cursor-pointer"
              >
                Request Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TAB 2: TESTER SUBMISSIONS REVIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeTab === 'TESTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#252930] rounded-[4px] overflow-hidden bg-[#0A0B0D]">
          {/* List (3 cols) */}
          <div className="lg:col-span-3 border-r border-[#252930] bg-[#090A0C] divide-y divide-[#1F232B] overflow-y-auto max-h-[750px]">
            <div className="p-3 text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6] bg-[#0B0C0E]">
              Test Runs ({testSessions.length})
            </div>
            {testSessions.map((t) => {
              const isSelected = t.id === activeTestId;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTestId(t.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#15181D] border-l-2 border-[#8AB4F8]' : 'hover:bg-[#101216]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#8AB4F8] font-medium">{t.id}</span>
                    <StatusBadge status={t.outcome} size="sm" />
                  </div>
                  <div className="text-xs font-medium text-[#F1F3F4] line-clamp-1 mb-1">
                    {t.scenarioName}
                  </div>
                  <div className="text-[11px] text-[#6F757D] font-mono flex items-center justify-between">
                    <span>{t.deviceName}</span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details (6 cols) */}
          <div className="lg:col-span-6 p-6 space-y-5 text-xs overflow-y-auto max-h-[750px] border-r border-[#252930]">
            {activeTest ? (
              <>
                <div className="border-b border-[#252930] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8AB4F8]">{activeTest.id}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={activeTest.outcome} />
                      <StatusBadge status={activeTest.status} size="sm" />
                    </div>
                  </div>
                  <h2 className="text-base font-semibold text-[#F1F3F4] mt-1">
                    {activeTest.scenarioName}
                  </h2>
                  <div className="text-[11px] text-[#9AA0A6] font-mono mt-1">
                    Objective: {activeTest.objectiveTitle}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#101216] border border-[#252930] rounded-[4px] text-[11px] font-mono">
                  <div>
                    <span className="text-[#6F757D] block text-[10px] uppercase">Device</span>
                    <span className="text-[#F1F3F4]">{activeTest.deviceName}</span>
                  </div>
                  <div>
                    <span className="text-[#6F757D] block text-[10px] uppercase">OS / Build</span>
                    <span className="text-[#F1F3F4]">{activeTest.androidVersion} ({activeTest.appVersion})</span>
                  </div>
                  <div>
                    <span className="text-[#6F757D] block text-[10px] uppercase">Tester</span>
                    <span className="text-[#F1F3F4]">{activeTest.testerName}</span>
                  </div>
                  <div>
                    <span className="text-[#6F757D] block text-[10px] uppercase">Recorded</span>
                    <span className="text-[#F1F3F4]">{new Date(activeTest.startedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Description
                    </div>
                    <p className="text-[#F1F3F4] leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                      {activeTest.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                        Expected Result
                      </div>
                      <p className="text-[#9AA0A6] bg-[#101216] p-2.5 rounded-[4px] border border-[#252930]">
                        {activeTest.expectedResult}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                        Actual Result
                      </div>
                      <p className="text-[#F1F3F4] bg-[#101216] p-2.5 rounded-[4px] border border-[#252930]">
                        {activeTest.actualResult}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                      Evidence Attachments ({activeTest.evidence.length})
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {activeTest.evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2.5 bg-[#101216] border border-[#252930] rounded-[4px] flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[#8AB4F8]">{ev.name}</span>
                            <span className="text-[#6F757D] ml-2">({ev.size})</span>
                          </div>
                          <span className="text-[#9AA0A6] text-[10px]">{ev.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-[#6F757D]">
                Select a test run to inspect.
              </div>
            )}
          </div>

          {/* Right Review Pane (3 cols) */}
          <div className="lg:col-span-3 p-5 bg-[#090A0C] flex flex-col justify-between text-xs space-y-4">
            <div className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6] pb-2 border-b border-[#252930]">
                Quality Decision
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Comments
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Verification observations, log verification note, or re-test reason..."
                  className="w-full bg-[#101216] border border-[#252930] rounded-[4px] p-2.5 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#252930]">
              <button
                onClick={() => handleTestDecision('APPROVED')}
                className="w-full py-2 bg-[#81C995] hover:bg-[#A8E5BA] text-[#0B0C0E] font-medium text-xs rounded-[4px] transition-colors cursor-pointer"
              >
                Approve Test Run
              </button>
              <button
                onClick={() => handleTestDecision('RE_TEST')}
                className="w-full py-2 bg-transparent hover:bg-[#15181D] border border-[#30343A] text-[#FDD663] text-xs rounded-[4px] transition-colors cursor-pointer"
              >
                Request Re-test
              </button>
              <button
                onClick={() => handleTestDecision('REJECTED')}
                className="w-full py-2 bg-transparent hover:bg-[#15181D] border border-[#30343A] text-[#F28B82] text-xs rounded-[4px] transition-colors cursor-pointer"
              >
                Reject / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
