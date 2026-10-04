import React, { useState } from 'react';
import {
  Search,
  Lock,
  X,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { AuditEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const AuditLogsView: React.FC = () => {
  const { auditEvents, selectedAuditEventId } = useConsole();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(
    auditEvents.find((a) => a.id === selectedAuditEventId) || null
  );

  const filteredEvents = auditEvents.filter((ev) => {
    const matchesSearch =
      !search ||
      ev.id.toLowerCase().includes(search.toLowerCase()) ||
      ev.actorName.toLowerCase().includes(search.toLowerCase()) ||
      ev.action.toLowerCase().includes(search.toLowerCase()) ||
      ev.resource.toLowerCase().includes(search.toLowerCase()) ||
      ev.details.summary.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || ev.actorRole === roleFilter;
    const matchesAction = actionFilter === 'ALL' || ev.action === actionFilter;
    const matchesResult = resultFilter === 'ALL' || ev.result === resultFilter;

    return matchesSearch && matchesRole && matchesAction && matchesResult;
  });

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            SECURITY & COMPLIANCE / AUDIT
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Audit Logs
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Immutable security ledger tracking administrative operations, test approvals, and database queries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#81C995]">
          <Lock className="w-3.5 h-3.5 text-[#81C995]" />
          <span>IMMUTABLE (READ ONLY)</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#252930] text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit ID, actor, resource..."
            className="w-full max-w-sm bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Action: All</option>
            <option value="WORK_ASSIGNED">WORK_ASSIGNED</option>
            <option value="WORK_STATUS_UPDATED">WORK_STATUS_UPDATED</option>
            <option value="DOCUMENTATION_SUBMITTED">DOCUMENTATION_SUBMITTED</option>
            <option value="DOCUMENTATION_REVIEWED">DOCUMENTATION_REVIEWED</option>
            <option value="TEST_SUBMITTED">TEST_SUBMITTED</option>
            <option value="TEST_APPROVED">TEST_APPROVED</option>
            <option value="TEST_RETEST_REQUESTED">TEST_RETEST_REQUESTED</option>
            <option value="DATABASE_EXPORT">DATABASE_EXPORT</option>
            <option value="MIGRATION_APPLIED">MIGRATION_APPLIED</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Role: All</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="TESTER">TESTER</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Result: All</option>
            <option value="SUCCESS">Success</option>
            <option value="DENIED">Denied</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Clean Audit Table (as specified in Section 21) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#252930] text-[11px] uppercase text-[#9AA0A6] tracking-wider">
              <th className="py-2.5 px-3">TIME</th>
              <th className="py-2.5 px-3">ACTOR</th>
              <th className="py-2.5 px-3">ACTION</th>
              <th className="py-2.5 px-3">RESOURCE</th>
              <th className="py-2.5 px-3">RESULT</th>
              <th className="py-2.5 px-3">IP ADDRESS</th>
              <th className="py-2.5 px-3 text-right">DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F232B]">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#6F757D]">
                  No audit log entries found.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="hover:bg-[#101216] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 text-[#9AA0A6] whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4] font-medium whitespace-nowrap">
                    {event.actorName}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4] text-[11px]">
                    {event.action}
                  </td>
                  <td className="py-3 px-3 text-[#9AA0A6] whitespace-nowrap">
                    <span className="text-[#8AB4F8] mr-1">{event.resourceId}</span>
                    <span className="text-[#6F757D]">({event.resource})</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={event.result} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[#6F757D] select-all">
                    {event.ipAddress}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className="text-[#8AB4F8] hover:underline cursor-pointer"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AUDIT DETAIL DRAWER */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#0A0B0D] border-l border-[#252930] shadow-2xl p-6 overflow-y-auto space-y-6 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[#8AB4F8] font-medium">
                  {selectedEvent.id}
                </span>
                <StatusBadge status={selectedEvent.result} size="sm" />
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-[#6F757D]">
                Summary
              </div>
              <p className="text-xs text-[#F1F3F4] mt-1 leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                {selectedEvent.details.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#252930] font-mono text-[11px]">
              <div>
                <span className="text-[#6F757D] block uppercase">Actor</span>
                <span className="text-[#F1F3F4] font-medium">{selectedEvent.actorName}</span>
                <span className="text-[#9AA0A6] block text-[10px]">{selectedEvent.actorRole}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">Timestamp</span>
                <span className="text-[#F1F3F4]">{new Date(selectedEvent.timestamp).toISOString()}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">Action</span>
                <span className="text-[#8AB4F8]">{selectedEvent.action}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block uppercase">Resource</span>
                <span className="text-[#F1F3F4]">{selectedEvent.resource} ({selectedEvent.resourceId})</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#6F757D] block uppercase">Origin IP & Client</span>
                <span className="text-[#9AA0A6] truncate block">{selectedEvent.userAgent}</span>
                <span className="text-[#6F757D] select-all">{selectedEvent.ipAddress}</span>
              </div>
            </div>

            {/* Diffs */}
            {(selectedEvent.details.before || selectedEvent.details.after) && (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] text-[#9AA0A6] uppercase">
                  State Mutation Diff
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-3 bg-[#101216] border border-[#252930] rounded-[4px]">
                    <span className="text-[#F28B82] block mb-1">PREVIOUS:</span>
                    <pre className="text-[#9AA0A6] overflow-x-auto text-[10px]">
                      {selectedEvent.details.before
                        ? JSON.stringify(selectedEvent.details.before, null, 2)
                        : '(none)'}
                    </pre>
                  </div>
                  <div className="p-3 bg-[#101216] border border-[#252930] rounded-[4px]">
                    <span className="text-[#81C995] block mb-1">NEW:</span>
                    <pre className="text-[#8AB4F8] overflow-x-auto text-[10px]">
                      {selectedEvent.details.after
                        ? JSON.stringify(selectedEvent.details.after, null, 2)
                        : '(none)'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Payload */}
            {selectedEvent.details.payload && (
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-[11px] text-[#9AA0A6] uppercase">
                  Payload Record
                </div>
                <pre className="p-3 bg-[#101216] border border-[#252930] rounded-[4px] text-[10px] text-[#8AB4F8] overflow-x-auto">
                  {JSON.stringify(selectedEvent.details.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
