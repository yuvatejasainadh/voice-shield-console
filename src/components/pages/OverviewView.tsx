import React from 'react';
import {
  Play,
  ArrowRight,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  FlaskConical,
  Database,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { StatusBadge } from '../common/StatusBadge';

export const OverviewView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    workItems,
    testSessions,
    devices,
    docs,
    objectives,
    auditEvents,
    navigate,
  } = useConsole();

  // Metrics
  const activeWork = workItems.filter((w) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(w.status)).length;
  const pendingDocReviews = docs.filter((d) => d.status === 'SUBMITTED').length;
  const pendingTestReviews = testSessions.filter((t) => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length;
  const totalPendingReviews = pendingDocReviews + pendingTestReviews;
  const activeTesting = testSessions.filter((t) => ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(t.status)).length;
  const activeDevices = devices.filter((d) => d.status === 'ACTIVE').length;
  const failedTests = testSessions.filter((t) => t.outcome === 'FAIL').length;

  // Format relative timestamp helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Action Icon helper for Recent Activity
  const getActionIcon = (action: string) => {
    if (action.includes('TEST')) {
      return <FlaskConical className="w-3.5 h-3.5 text-[#8AB4F8]" />;
    } else if (action.includes('WORK')) {
      return <Briefcase className="w-3.5 h-3.5 text-[#81C995]" />;
    } else if (action.includes('DATABASE') || action.includes('RDS')) {
      return <Database className="w-3.5 h-3.5 text-[#FDD663]" />;
    } else if (action.includes('DOC')) {
      return <FileText className="w-3.5 h-3.5 text-[#8AB4F8]" />;
    }
    return <Shield className="w-3.5 h-3.5 text-[#9AA0A6]" />;
  };

  // -------------------------------------------------------------
  // TESTER OVERVIEW (Clean Minimalist Cloud Console)
  // -------------------------------------------------------------
  if (currentRole === 'TESTER') {
    return (
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
              OPERATIONS / TESTING
            </div>
            <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
              Testing Cockpit
            </h1>
            <p className="text-sm text-[#9AA0A6] mt-1">
              Hardware verification, scenario execution, and evidence recording.
            </p>
            <div className="text-xs text-[#6F757D] font-mono mt-1">
              Last updated 2 minutes ago
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('quick-test')}
              className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start New Test</span>
            </button>
          </div>
        </div>

        {/* Minimal Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#252930] py-4 border-y border-[#252930]">
          <div className="px-4 py-2 first:pl-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              ASSIGNED OBJECTIVES
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {objectives.length}
            </div>
            <div className="text-xs text-[#6F757D] mt-0.5">Ready for testing</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              ACTIVE DEVICES
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {activeDevices}
            </div>
            <div className="text-xs text-[#81C995] mt-0.5">Certified Android hardware</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              SUBMITTED FOR REVIEW
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {pendingTestReviews}
            </div>
            <div className="text-xs text-[#FDD663] mt-0.5">Awaiting admin review</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              RE-TEST REQUIRED
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {testSessions.filter((t) => t.status === 'RE_TEST_REQUIRED').length}
            </div>
            <div className="text-xs text-[#F28B82] mt-0.5">Follow-up run flagged</div>
          </div>
        </div>

        {/* Assigned Objectives */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Assigned Testing Objectives
            </h2>
            <span className="text-xs text-[#6F757D] font-mono">
              {objectives.length} Total
            </span>
          </div>

          <div className="divide-y divide-[#1F232B] border-t border-b border-[#252930]">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#101216] px-2 transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#8AB4F8] font-medium">
                      {obj.id}
                    </span>
                    <span className="text-sm font-medium text-[#F1F3F4]">
                      {obj.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#9AA0A6] mt-1 line-clamp-1">
                    {obj.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#6F757D] font-mono mt-1">
                    <span>Target: {obj.targetAppVersion}</span>
                    <span>·</span>
                    <span>Assigned by: {obj.assignedBy}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('quick-test')}
                  className="px-3 py-1 bg-transparent hover:bg-[#15181D] border border-[#30343A] text-xs text-[#F1F3F4] rounded-[4px] self-start sm:self-auto cursor-pointer"
                >
                  Execute Test →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Recent Test Submissions
            </h2>
            <button
              onClick={() => navigate('testing')}
              className="text-xs text-[#8AB4F8] hover:underline cursor-pointer"
            >
              View all →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                  <th className="py-2 px-3">Test ID</th>
                  <th className="py-2 px-3">Scenario</th>
                  <th className="py-2 px-3">Device</th>
                  <th className="py-2 px-3">Outcome</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {testSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => navigate('testing', { testId: session.id })}
                    className="hover:bg-[#101216] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-[#8AB4F8]">
                      {session.id}
                    </td>
                    <td className="py-3 px-3 text-[#F1F3F4] font-medium">
                      {session.scenarioName}
                    </td>
                    <td className="py-3 px-3 text-[#9AA0A6]">
                      {session.deviceName}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={session.outcome} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={session.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right text-[#6F757D] font-mono">
                      {getRelativeTime(session.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEVELOPER OVERVIEW (Clean Minimalist Cloud Console)
  // -------------------------------------------------------------
  if (currentRole === 'DEVELOPER') {
    const myWork = workItems.filter((w) => currentUser && w.assigneeId === currentUser.id);
    const myDocs = docs.filter((d) => currentUser && d.authorId === currentUser.id);

    return (
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
              OPERATIONS / DEVELOPER WORKSPACE
            </div>
            <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
              Developer Workspace
            </h1>
            <p className="text-sm text-[#9AA0A6] mt-1">
              Active engineering assignments, technical PR documentation, and code reviews.
            </p>
            <div className="text-xs text-[#6F757D] font-mono mt-1">
              Last updated 2 minutes ago
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('documentation')}
              className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Work</span>
            </button>
          </div>
        </div>

        {/* Minimal Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#252930] py-4 border-y border-[#252930]">
          <div className="px-4 py-2 first:pl-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              MY WORK ITEMS
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {myWork.length}
            </div>
            <div className="text-xs text-[#6F757D] mt-0.5">Assigned to you</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              DOCS UNDER REVIEW
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {myDocs.filter((d) => d.status === 'SUBMITTED').length}
            </div>
            <div className="text-xs text-[#FDD663] mt-0.5">Awaiting admin review</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              CHANGES REQUESTED
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {myDocs.filter((d) => d.status === 'CHANGES_REQUESTED').length}
            </div>
            <div className="text-xs text-[#F28B82] mt-0.5">Action items required</div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
              APPROVED DELIVERABLES
            </div>
            <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
              {myDocs.filter((d) => d.status === 'APPROVED').length}
            </div>
            <div className="text-xs text-[#81C995] mt-0.5">Merged and verified</div>
          </div>
        </div>

        {/* My Work Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              My Engineering Tasks
            </h2>
            <button
              onClick={() => navigate('work')}
              className="text-xs text-[#8AB4F8] hover:underline cursor-pointer"
            >
              Full work list →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                  <th className="py-2 px-3">Work ID</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Priority</th>
                  <th className="py-2 px-3">Assigned By</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {myWork.map((work) => (
                  <tr
                    key={work.id}
                    onClick={() => navigate('work', { workId: work.id })}
                    className="hover:bg-[#101216] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-[#8AB4F8]">
                      {work.id}
                    </td>
                    <td className="py-3 px-3 text-[#F1F3F4] font-medium max-w-sm truncate">
                      {work.title}
                    </td>
                    <td className="py-3 px-3 text-[#9AA0A6] font-mono">
                      {work.priority}
                    </td>
                    <td className="py-3 px-3 text-[#9AA0A6]">
                      {work.assignedByName}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={work.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[#6F757D] font-mono">
                      {new Date(work.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('work', { workId: work.id });
                        }}
                        className="text-[#8AB4F8] hover:underline cursor-pointer"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentation Submissions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Documentation Submissions & Feedback
            </h2>
            <button
              onClick={() => navigate('documentation')}
              className="text-xs text-[#8AB4F8] hover:underline cursor-pointer"
            >
              Write new doc →
            </button>
          </div>

          <div className="divide-y divide-[#1F232B] border-t border-b border-[#252930]">
            {myDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate('documentation', { docId: doc.id })}
                className="py-3.5 px-2 hover:bg-[#101216] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#8AB4F8]">
                      {doc.id} (v{doc.version})
                    </span>
                    <span className="text-sm font-medium text-[#F1F3F4]">
                      {doc.workTitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#9AA0A6] mt-1 line-clamp-1">
                    {doc.whatIDid}
                  </p>
                  {doc.reviewFeedback && (
                    <div className="text-xs text-[#FDD663] mt-1 font-mono">
                      Feedback from {doc.reviewerName || 'Reviewer'}: {doc.reviewFeedback}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  <StatusBadge status={doc.status} size="sm" />
                  <span className="text-xs text-[#8AB4F8] hover:underline">
                    Edit / Revise →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUPER ADMIN & ADMIN OVERVIEW (EXACT VISUAL MATCH TO IMAGE.PNG)
  // -------------------------------------------------------------
  return (
    <div className="p-8 space-y-7 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Operations Overview
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            VoiceShield engineering, testing and infrastructure activity.
          </p>
          <div className="text-xs text-[#6F757D] font-mono mt-1">
            Last updated 2 minutes ago
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('work')}
            className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ Assign Work</span>
          </button>
          <button
            onClick={() => navigate('reviews')}
            className="px-3.5 py-1.5 bg-transparent border border-[#30343A] hover:bg-[#15181D] text-[#F1F3F4] font-normal text-xs rounded-[4px] transition-colors cursor-pointer"
          >
            Review Queue
          </button>
        </div>
      </div>

      {/* 2. Flat Metrics Strip (No cards, pure columns with dividers) */}
      <div className="grid grid-cols-2 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[#252930] py-4 border-y border-[#252930]">
        <div
          onClick={() => navigate('work')}
          className="px-4 py-2 first:pl-0 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            ACTIVE WORK
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {activeWork}
          </div>
          <div className="text-xs text-[#6F757D] mt-0.5">In progress / assigned</div>
        </div>

        <div
          onClick={() => navigate('reviews')}
          className="px-4 py-2 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            PENDING REVIEWS
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {totalPendingReviews}
          </div>
          <div className="text-xs text-[#FDD663] mt-0.5">Action required</div>
        </div>

        <div
          onClick={() => navigate('testing')}
          className="px-4 py-2 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            ACTIVE TESTING
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {activeTesting}
          </div>
          <div className="text-xs text-[#6F757D] mt-0.5">Across lab devices</div>
        </div>

        <div
          onClick={() => navigate('devices')}
          className="px-4 py-2 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            DEVICES
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {activeDevices}
          </div>
          <div className="text-xs text-[#81C995] mt-0.5">Registered</div>
        </div>

        <div
          onClick={() => navigate('testing')}
          className="px-4 py-2 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            FAILED TESTS
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {failedTests}
          </div>
          <div className="text-xs text-[#F28B82] mt-0.5">Requires re-test</div>
        </div>

        <div
          onClick={() => navigate('reviews')}
          className="px-4 py-2 cursor-pointer hover:bg-[#101216]/50 transition-colors"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            DOCS AWAITING
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1F3F4] mt-1 tabular-nums">
            {pendingDocReviews}
          </div>
          <div className="text-xs text-[#6F757D] mt-0.5">Developer PR docs</div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout: Recent Work & Recent Testing Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Work */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Recent Work
            </h2>
            <button
              onClick={() => navigate('work')}
              className="text-xs text-[#8AB4F8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                  <th className="py-2.5 px-2">ID</th>
                  <th className="py-2.5 px-3">TITLE</th>
                  <th className="py-2.5 px-3">ASSIGNEE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-2 text-right">UPDATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {workItems.slice(0, 5).map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate('work', { workId: w.id })}
                    className="hover:bg-[#101216] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 font-mono text-[#8AB4F8]">
                      {w.id}
                    </td>
                    <td className="py-2.5 px-3 text-[#F1F3F4] font-medium max-w-[200px] truncate">
                      {w.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#9AA0A6]">
                      {w.assigneeName}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={w.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#6F757D] font-mono">
                      {getRelativeTime(w.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Testing Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Recent Testing Activity
            </h2>
            <button
              onClick={() => navigate('testing')}
              className="text-xs text-[#8AB4F8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                  <th className="py-2.5 px-2">TEST ID</th>
                  <th className="py-2.5 px-3">OBJECTIVE</th>
                  <th className="py-2.5 px-3">DEVICE</th>
                  <th className="py-2.5 px-3">OUTCOME</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-2 text-right">UPDATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {testSessions.slice(0, 5).map((ts) => (
                  <tr
                    key={ts.id}
                    onClick={() => navigate('testing', { testId: ts.id })}
                    className="hover:bg-[#101216] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 font-mono text-[#8AB4F8]">
                      {ts.id}
                    </td>
                    <td className="py-2.5 px-3 text-[#F1F3F4] font-medium max-w-[140px] truncate">
                      {ts.scenarioName}
                    </td>
                    <td className="py-2.5 px-3 text-[#9AA0A6] whitespace-nowrap">
                      {ts.deviceName.replace('Google ', '').replace('Samsung ', '')}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={ts.outcome} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={ts.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#6F757D] font-mono">
                      {getRelativeTime(ts.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity (Bottom Table) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F1F3F4]">
            Recent Activity
          </h2>
          <button
            onClick={() => navigate('audit')}
            className="text-xs text-[#8AB4F8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                <th className="py-2.5 px-2">TIME</th>
                <th className="py-2.5 px-4">ACTOR</th>
                <th className="py-2.5 px-4">ACTION</th>
                <th className="py-2.5 px-4">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232B]">
              {auditEvents.slice(0, 5).map((event) => (
                <tr
                  key={event.id}
                  onClick={() => navigate('audit', { auditId: event.id })}
                  className="hover:bg-[#101216] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-2 font-mono text-[#9AA0A6] whitespace-nowrap flex items-center gap-2">
                    {getActionIcon(event.action)}
                    <span>
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#F1F3F4] font-medium whitespace-nowrap">
                    {event.actorName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#9AA0A6] whitespace-nowrap">
                    {event.action}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-[#9AA0A6] truncate max-w-xl">
                    <span className="font-mono text-[#8AB4F8] mr-2">
                      {event.resourceId}
                    </span>
                    <span>·</span>
                    <span className="ml-2 text-[#F1F3F4]">
                      {event.details.summary}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
