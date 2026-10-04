import React, { useState } from 'react';
import {
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { User, Role } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const TeamView: React.FC = () => {
  const {
    currentUser,
    users,
    addTeamUser,
    updateTeamUserRole,
    toggleTeamUserStatus,
    openConfirmDialog,
  } = useConsole();

  const [search, setSearch] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('DEVELOPER');

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addTeamUser({
      name: newName,
      email: newEmail,
      role: newRole,
    });

    setNewName('');
    setNewEmail('');
    setIsAddUserOpen(false);
  };

  const handleRoleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateTeamUserRole(editingUser.id, newRole);
      setEditingUser(null);
    }
  };

  const handleToggleStatus = (targetUser: User) => {
    openConfirmDialog({
      title: `${targetUser.status === 'ACTIVE' ? 'Disable' : 'Enable'} Console User`,
      actionName: 'MODIFY_USER_STATUS',
      resourceDetails: `${targetUser.name} (${targetUser.email}, Role: ${targetUser.role})`,
      warningNote:
        targetUser.status === 'ACTIVE'
          ? 'Disabling this account immediately revokes all active API sessions and PostgreSQL RDS connection tokens.'
          : 'Enabling restores access permissions.',
      confirmButtonText: targetUser.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account',
      onConfirm: () => {
        toggleTeamUserStatus(targetUser.id);
      },
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            ACCESS & IDENTITY / RBAC
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Super Admin directory of internal console operators, privileges, and session states.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Provision User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 py-3 border-y border-[#252930] text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operators..."
            className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-3 py-1.5 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
          />
        </div>

        <div className="text-xs font-mono text-[#9AA0A6]">
          <span>Total Operators: <strong className="text-[#F1F3F4] font-normal">{users.length}</strong></span>
        </div>
      </div>

      {/* Clean Table (Section 23: USER, ROLE, STATUS) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
              <th className="py-2.5 px-3">USER</th>
              <th className="py-2.5 px-3">EMAIL</th>
              <th className="py-2.5 px-3">ROLE</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3">LAST ACTIVE</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F232B]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#101216] transition-colors">
                <td className="py-3 px-3 font-medium text-[#F1F3F4]">
                  {user.name}
                </td>
                <td className="py-3 px-3 text-[#9AA0A6] font-mono">
                  {user.email}
                </td>
                <td className="py-3 px-3 text-[#F1F3F4] font-mono capitalize">
                  {user.role.toLowerCase().replace('_', ' ')}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={user.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-[#6F757D] font-mono">
                  {user.lastActive.includes('T') ? new Date(user.lastActive).toLocaleDateString() : user.lastActive}
                </td>
                <td className="py-3 px-3 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setNewRole(user.role);
                    }}
                    className="text-[#8AB4F8] hover:underline cursor-pointer"
                  >
                    Edit Role
                  </button>
                  {currentUser && user.id !== currentUser.id && (
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'text-[#F28B82] hover:underline'
                          : 'text-[#81C995] hover:underline'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs text-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F1F3F4]">
                Provision Operator Account
              </h2>
              <button onClick={() => setIsAddUserOpen(false)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh K"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Internal Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@voiceshield.internal"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  Role Assignment
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                >
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="TESTER">TESTER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs text-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F1F3F4]">
                Modify Role for {editingUser.name}
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                >
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="TESTER">TESTER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
