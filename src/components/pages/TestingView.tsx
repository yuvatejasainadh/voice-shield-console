import React, { useState } from 'react';
import {
  Play,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { TestSession } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const TestingView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    testSessions,
    objectives,
    devices,
    selectedTestId,
    navigate,
    createTestingObjective,
  } = useConsole();

  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(
    testSessions.find((t) => t.id === selectedTestId) || null
  );

  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjDesc, setNewObjDesc] = useState('');
  const [newObjVersion, setNewObjVersion] = useState('v2.4.0');

  const canManageObjectives = ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'].includes(currentRole);

  const filteredSessions = testSessions.filter((s) => {
    const matchesSearch =
      !search ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.scenarioName.toLowerCase().includes(search.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.testerName.toLowerCase().includes(search.toLowerCase());

    const matchesOutcome = outcomeFilter === 'ALL' || s.outcome === outcomeFilter;
    const matchesDevice = deviceFilter === 'ALL' || s.deviceId === deviceFilter;

    return matchesSearch && matchesOutcome && matchesDevice;
  });

  const handleCreateObj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjTitle.trim()) return;
    createTestingObjective({
      title: newObjTitle,
      description: newObjDesc,
      targetAppVersion: newObjVersion,
      targetAndroidVersions: ['Android 14', 'Android 15'],
      assignedToTesterIds: ['usr_tester_1'],
    });
    setNewObjTitle('');
    setNewObjDesc('');
    setIsObjModalOpen(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / TESTING
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Testing
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Objectives, sessions and submitted results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManageObjectives && (
            <button
              onClick={() => setIsObjModalOpen(true)}
              className="px-3.5 py-1.5 bg-transparent hover:bg-[#15181D] text-[#F1F3F4] border border-[#30343A] text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Objective</span>
            </button>
          )}

          <button
            onClick={() => navigate('quick-test')}
            className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>+ Start New Test</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#252930] text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test ID, scenario, device, tester..."
            className="w-full max-w-sm bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Outcome: All</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
            <option value="BLOCKED">Blocked</option>
            <option value="NOT_TESTED">Not Tested</option>
          </select>

          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Device: All</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean Full-Width Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
              <th className="py-2.5 px-3">TEST ID</th>
              <th className="py-2.5 px-3">OBJECTIVE</th>
              <th className="py-2.5 px-3">TESTER</th>
              <th className="py-2.5 px-3">DEVICE</th>
              <th className="py-2.5 px-3">OUTCOME</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3 text-right">UPDATED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F232B]">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#6F757D]">
                  No testing records found.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="hover:bg-[#101216] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-[#8AB4F8] font-medium">
                    {session.id}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4] font-medium max-w-sm truncate">
                    {session.scenarioName}
                  </td>
                  <td className="py-3 px-3 text-[#9AA0A6]">
                    {session.testerName}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4]">
                    {session.deviceName}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={session.outcome} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={session.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right text-[#6F757D] font-mono">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Session Details Drawer */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#0A0B0D] border-l border-[#252930] shadow-2xl p-6 overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#8AB4F8] font-medium text-sm">
                  {selectedSession.id}
                </span>
                <StatusBadge status={selectedSession.outcome} />
                <StatusBadge status={selectedSession.status} size="sm" />
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-[#6F757D]">
                Scenario
              </div>
              <h2 className="text-base font-semibold text-[#F1F3F4] mt-0.5">
                {selectedSession.scenarioName}
              </h2>
              <p className="text-xs text-[#9AA0A6] mt-2 leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                {selectedSession.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#252930] text-xs">
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Hardware
                </span>
                <span className="text-[#F1F3F4] font-medium">{selectedSession.deviceName}</span>
                <span className="text-[#9AA0A6] text-[11px] block font-mono">{selectedSession.deviceModel}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Tester
                </span>
                <span className="text-[#F1F3F4]">{selectedSession.testerName}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  App Build
                </span>
                <span className="text-[#F1F3F4] font-mono">{selectedSession.appVersion}</span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Date
                </span>
                <span className="text-[#F1F3F4] font-mono">
                  {new Date(selectedSession.startedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                  Expected Result
                </div>
                <div className="text-[#9AA0A6] bg-[#101216] p-2.5 rounded-[4px] border border-[#252930]">
                  {selectedSession.expectedResult}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                  Actual Result
                </div>
                <div className="text-[#F1F3F4] bg-[#101216] p-2.5 rounded-[4px] border border-[#252930]">
                  {selectedSession.actualResult}
                </div>
              </div>

              {selectedSession.testerNotes && (
                <div>
                  <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                    Tester Notes
                  </div>
                  <div className="text-[#9AA0A6] bg-[#101216] p-2.5 rounded-[4px] border border-[#252930] italic">
                    "{selectedSession.testerNotes}"
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-mono text-[#9AA0A6] uppercase mb-1">
                  Evidence Files ({selectedSession.evidence.length})
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedSession.evidence.map((ev) => (
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

            {['SUPER_ADMIN', 'ADMIN'].includes(currentRole) && (
              <div className="pt-3 border-t border-[#252930]">
                <button
                  onClick={() => {
                    const id = selectedSession.id;
                    setSelectedSession(null);
                    navigate('reviews', { testId: id });
                  }}
                  className="w-full py-2 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] cursor-pointer"
                >
                  Open in Review Queue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE OBJECTIVE MODAL */}
      {isObjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930] mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F1F3F4]">
                Define Testing Objective
              </h2>
              <button onClick={() => setIsObjModalOpen(false)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateObj} className="space-y-4">
              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newObjTitle}
                  onChange={(e) => setNewObjTitle(e.target.value)}
                  placeholder="e.g. Validate offline spoofing detection on Android 15"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newObjDesc}
                  onChange={(e) => setNewObjDesc(e.target.value)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Target App Version
                </label>
                <input
                  type="text"
                  value={newObjVersion}
                  onChange={(e) => setNewObjVersion(e.target.value)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setIsObjModalOpen(false)}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Create Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
