import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  ArrowRight,
  User,
  Clock,
  Calendar,
  X,
  FileCode2,
  ExternalLink,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { WorkItem, WorkStatus, Priority, Role } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const WorkView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    workItems,
    users,
    selectedWorkId,
    navigate,
    createWorkItem,
    updateWorkStatus,
    assignWorkItem,
  } = useConsole();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<'NONE' | 'CREATE' | 'DETAILS'>('NONE');
  const [activeDetailItem, setActiveDetailItem] = useState<WorkItem | null>(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<WorkItem['type']>('FEATURE');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newAssigneeId, setNewAssigneeId] = useState(users[2]?.id || '');
  const [newDueDate, setNewDueDate] = useState('2026-10-12');

  const canAssignWork = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  React.useEffect(() => {
    if (selectedWorkId) {
      const match = workItems.find((w) => w.id === selectedWorkId);
      if (match) {
        setActiveDetailItem(match);
        setActiveModal('DETAILS');
      }
    }
  }, [selectedWorkId, workItems]);

  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'ALL' || item.assigneeId === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createWorkItem({
      title: newTitle,
      description: newDescription,
      type: newType,
      priority: newPriority,
      assigneeId: newAssigneeId,
      dueDate: new Date(newDueDate).toISOString(),
    });

    setNewTitle('');
    setNewDescription('');
    setActiveModal('NONE');
  };

  const openDetails = (item: WorkItem) => {
    setActiveDetailItem(item);
    setActiveModal('DETAILS');
  };

  const handleStatusChange = (status: WorkStatus) => {
    if (activeDetailItem) {
      updateWorkStatus(activeDetailItem.id, status);
      setActiveDetailItem({ ...activeDetailItem, status });
    }
  };

  const handleReassign = (assigneeId: string) => {
    if (activeDetailItem) {
      assignWorkItem(activeDetailItem.id, assigneeId);
      const targetUser = users.find((u) => u.id === assigneeId);
      if (targetUser) {
        setActiveDetailItem({
          ...activeDetailItem,
          assigneeId: targetUser.id,
          assigneeName: targetUser.name,
          assigneeRole: targetUser.role,
        });
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            OPERATIONS / WORK
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Work Management
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Engineering assignments, audio processing tasks, and documentation deliverables.
          </p>
        </div>

        {canAssignWork && (
          <button
            onClick={() => setActiveModal('CREATE')}
            className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Assign Work</span>
          </button>
        )}
      </div>

      {/* Toolbar: Search & Filters (Clean, Google Cloud style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#252930] text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work ID, title, keyword..."
            className="w-full max-w-sm bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Status: All</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DOCUMENTATION_SUBMITTED">Doc Submitted</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#9AA0A6] focus:text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
          >
            <option value="ALL">Assignee: All</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ')})
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
              <th className="py-2.5 px-3">Work ID</th>
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Assignee</th>
              <th className="py-2.5 px-3">Assigned By</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F232B]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#6F757D]">
                  No matching work items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => openDetails(item)}
                  className="hover:bg-[#101216] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-[#8AB4F8] font-medium">
                    {item.id}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4] font-medium max-w-sm truncate">
                    {item.title}
                  </td>
                  <td className="py-3 px-3 text-[#9AA0A6] font-mono text-[11px]">
                    {item.type}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4]">
                    {item.assigneeName}
                  </td>
                  <td className="py-3 px-3 text-[#9AA0A6]">
                    {item.assignedByName}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <span
                      className={
                        item.priority === 'CRITICAL'
                          ? 'text-[#F28B82]'
                          : item.priority === 'HIGH'
                          ? 'text-[#FDD663]'
                          : 'text-[#9AA0A6]'
                      }
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[#6F757D] font-mono">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetails(item);
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

      {/* CREATE WORK ITEM MODAL (Minimal Google Cloud Style) */}
      {activeModal === 'CREATE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930] mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F1F3F4]">
                Assign Work Item
              </h2>
              <button
                onClick={() => setActiveModal('NONE')}
                className="text-[#9AA0A6] hover:text-[#F1F3F4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                  Work Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. RingBuffer zero-copy audio optimization"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Problem statement, latency targets, and architecture constraints..."
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  >
                    <option value="FEATURE">Feature</option>
                    <option value="OPTIMIZATION">Optimization</option>
                    <option value="SECURITY">Security</option>
                    <option value="BUG_FIX">Bug Fix</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                    Assignee
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  >
                    {users
                      .filter((u) => (currentRole === 'ADMIN' ? u.role === 'DEVELOPER' || (currentUser && u.id === currentUser.id) : true))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9AA0A6] text-[11px] mb-1 font-mono uppercase">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252930] mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORK ITEM DETAILS DRAWER (Flat resource inspector) */}
      {activeModal === 'DETAILS' && activeDetailItem && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
          onClick={() => setActiveModal('NONE')}
        >
          <div
            className="w-full max-w-lg h-full bg-[#0A0B0D] border-l border-[#252930] shadow-2xl p-6 overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#8AB4F8] font-medium text-sm">
                  {activeDetailItem.id}
                </span>
                <StatusBadge status={activeDetailItem.status} />
              </div>
              <button
                onClick={() => setActiveModal('NONE')}
                className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-base font-semibold text-[#F1F3F4]">
                {activeDetailItem.title}
              </h2>
              <p className="text-xs text-[#9AA0A6] mt-2 leading-relaxed bg-[#101216] p-3 rounded-[4px] border border-[#252930]">
                {activeDetailItem.description}
              </p>
            </div>

            {/* Metadata Flat Grid */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#252930] text-xs">
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Assignee
                </span>
                <span className="text-[#F1F3F4] font-medium">
                  {activeDetailItem.assigneeName}
                </span>
                <span className="text-[#9AA0A6] text-[11px] block">
                  {activeDetailItem.assigneeRole.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Assigned By
                </span>
                <span className="text-[#F1F3F4]">
                  {activeDetailItem.assignedByName}
                </span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Priority
                </span>
                <span className="text-[#F1F3F4] font-mono">
                  {activeDetailItem.priority}
                </span>
              </div>
              <div>
                <span className="text-[#6F757D] block text-[11px] font-mono uppercase">
                  Due Date
                </span>
                <span className="text-[#F1F3F4] font-mono">
                  {new Date(activeDetailItem.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status Transitions */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
                Status Transition
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {activeDetailItem.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStatusChange('ACCEPTED')}
                    className="px-3 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] text-[#F1F3F4] border border-[#252930] cursor-pointer"
                  >
                    Accept Work
                  </button>
                )}
                {['ASSIGNED', 'ACCEPTED'].includes(activeDetailItem.status) && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] text-[#8AB4F8] border border-[#252930] cursor-pointer"
                  >
                    Start Work (In Progress)
                  </button>
                )}
                {activeDetailItem.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => {
                      setActiveModal('NONE');
                      navigate('documentation', { workId: activeDetailItem.id });
                    }}
                    className="px-3.5 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Submit Documentation</span>
                  </button>
                )}
                {['DOCUMENTATION_SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED'].includes(activeDetailItem.status) && (
                  <button
                    onClick={() => {
                      setActiveModal('NONE');
                      navigate('reviews', { docId: activeDetailItem.docId });
                    }}
                    className="px-3 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] text-[#8AB4F8] border border-[#252930] cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Submitted Documentation</span>
                  </button>
                )}
                {canAssignWork && activeDetailItem.status === 'APPROVED' && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="px-3 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] text-[#81C995] border border-[#252930] cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>

            {/* Reassign (Privileged) */}
            {canAssignWork && (
              <div className="space-y-2 pt-3 border-t border-[#252930]">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
                  Reassign Work Item
                </div>
                <select
                  defaultValue={activeDetailItem.assigneeId}
                  onChange={(e) => handleReassign(e.target.value)}
                  className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-xs text-[#F1F3F4]"
                >
                  {users
                    .filter((u) => (currentRole === 'ADMIN' ? u.role === 'DEVELOPER' : true))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2 pt-3 border-t border-[#252930] text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
                History
              </div>
              <div className="space-y-2 text-[#9AA0A6]">
                <div>
                  <span className="font-mono text-[#6F757D] text-[11px]">
                    {new Date(activeDetailItem.createdAt).toLocaleString()}
                  </span>
                  <div className="text-[#F1F3F4]">
                    Created and assigned by {activeDetailItem.assignedByName}
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[#6F757D] text-[11px]">
                    {new Date(activeDetailItem.updatedAt).toLocaleString()}
                  </span>
                  <div className="text-[#F1F3F4]">
                    Current status: {activeDetailItem.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
