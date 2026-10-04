import React, { useState } from 'react';
import {
  Database,
  Table as TableIcon,
  Search,
  Plus,
  Trash2,
  X,
  KeyRound,
  FileCode2,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { DatabaseTableMeta, DatabaseUser, DatabaseMigration } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const DatabaseView: React.FC = () => {
  const {
    rdsMetrics,
    databaseTables,
    databaseRows,
    databaseUsers,
    migrations,
    addDatabaseRow,
    deleteDatabaseRow,
    addDatabaseUser,
    toggleDatabaseUserStatus,
    applyMigration,
    openConfirmDialog,
  } = useConsole();

  const [activeSubTab, setActiveSubTab] = useState<'EXPLORER' | 'USERS' | 'MIGRATIONS'>('EXPLORER');
  const [selectedTableName, setSelectedTableName] = useState<string>('work_items');
  const [explorerTab, setExplorerTab] = useState<'DATA' | 'STRUCTURE'>('DATA');
  const [dataSearch, setDataSearch] = useState('');

  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRowPayload, setNewRowPayload] = useState<Record<string, string>>({});

  const [isAddDbUserOpen, setIsAddDbUserOpen] = useState(false);
  const [newDbUsername, setNewDbUsername] = useState('');
  const [newDbRole, setNewDbRole] = useState<DatabaseUser['role']>('voiceshield_writer');

  const [activeViewMigration, setActiveViewMigration] = useState<DatabaseMigration | null>(null);

  const selectedTableMeta = databaseTables.find((t) => t.name === selectedTableName) || databaseTables[0];
  const tableData = databaseRows[selectedTableName] || [];

  const filteredData = tableData.filter((row) => {
    if (!dataSearch) return true;
    const str = Object.values(row).join(' ').toLowerCase();
    return str.includes(dataSearch.toLowerCase());
  });

  const primaryKeyCol = selectedTableMeta.columns.find((c) => c.isPrimaryKey)?.name || 'id';

  const handleDeleteRecord = (pkValue: string) => {
    openConfirmDialog({
      title: 'Delete Database Record',
      actionName: 'DELETE_TABLE_RECORD',
      resourceDetails: `Table: public.${selectedTableName} · Key: ${primaryKeyCol} = ${pkValue}`,
      warningNote:
        'This is a privileged operation on PostgreSQL RDS cluster ap-south-1. Deleted rows may cascade or trigger foreign key violations.',
      confirmButtonText: 'Delete Record',
      onConfirm: () => {
        deleteDatabaseRow(selectedTableName, primaryKeyCol, pkValue);
      },
    });
  };

  const handleApplyMigration = (m: DatabaseMigration) => {
    openConfirmDialog({
      title: 'Apply Schema Migration',
      actionName: 'APPLY_SCHEMA_MIGRATION',
      resourceDetails: `Migration ID: ${m.id} (${m.description}) · Target: voiceshield.public`,
      warningNote:
        'Executing DDL statements acquires ACCESS EXCLUSIVE locks on affected tables. Migration execution is logged to audit partition.',
      confirmButtonText: 'Apply Migration',
      onConfirm: () => {
        applyMigration(m.id);
      },
    });
  };

  const handleInsertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDatabaseRow(selectedTableName, newRowPayload);
    setIsAddRowOpen(false);
    setNewRowPayload({});
  };

  const handleCreateDbUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbUsername.trim()) return;
    addDatabaseUser({
      username: newDbUsername,
      role: newDbRole,
    });
    setNewDbUsername('');
    setIsAddDbUserOpen(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header (Section 20: Header: PostgreSQL, Subheader: voiceshield) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            INFRASTRUCTURE / DATABASE
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            PostgreSQL
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1 font-mono">
            voiceshield
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center p-1 bg-[#101216] border border-[#252930] rounded-[4px] text-xs">
          <button
            onClick={() => setActiveSubTab('EXPLORER')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'EXPLORER'
                ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </button>
          <button
            onClick={() => setActiveSubTab('USERS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'USERS'
                ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Access Roles ({databaseUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('MIGRATIONS')}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'MIGRATIONS'
                ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Migrations ({migrations.length})</span>
          </button>
        </div>
      </div>

      {/* Top Metadata Strip (Section 20: STATUS, ENGINE, REGION, VERSION) */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#252930] py-3.5 border-y border-[#252930] font-mono text-xs">
        <div className="px-4 py-1 first:pl-0">
          <span className="text-[#6F757D] text-[10px] block uppercase">STATUS</span>
          <div className="mt-1">
            <StatusBadge status="AVAILABLE" size="sm" />
          </div>
        </div>

        <div className="px-4 py-1">
          <span className="text-[#6F757D] text-[10px] block uppercase">ENGINE</span>
          <div className="text-[#F1F3F4] font-medium mt-0.5">PostgreSQL</div>
        </div>

        <div className="px-4 py-1">
          <span className="text-[#6F757D] text-[10px] block uppercase">REGION</span>
          <div className="text-[#F1F3F4] font-medium mt-0.5">{rdsMetrics?.region || 'us-east-1'}</div>
        </div>

        <div className="px-4 py-1">
          <span className="text-[#6F757D] text-[10px] block uppercase">VERSION</span>
          <div className="text-[#F1F3F4] font-medium mt-0.5">{rdsMetrics?.engineVersion || '15.4'}</div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* EXPLORER VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'EXPLORER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#252930] rounded-[4px] overflow-hidden bg-[#0A0B0D]">
          {/* Left Schema Tree (3 cols) */}
          <div className="lg:col-span-3 border-r border-[#252930] bg-[#090A0C] p-3 space-y-2 font-mono text-xs max-h-[700px] overflow-y-auto">
            <div className="text-[11px] font-semibold text-[#9AA0A6] uppercase tracking-wider px-2 py-1">
              voiceshield
            </div>
            <div className="pl-2 space-y-1">
              <div className="text-[#6F757D] text-[11px] px-2 py-0.5 font-semibold">
                └── public
              </div>
              <div className="pl-4 space-y-0.5">
                {databaseTables.map((tbl) => {
                  const isSelected = tbl.name === selectedTableName;
                  return (
                    <button
                      key={tbl.name}
                      onClick={() => {
                        setSelectedTableName(tbl.name);
                        setDataSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[2px] text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                          : 'text-[#9AA0A6] hover:text-[#F1F3F4] hover:bg-[#101216]'
                      }`}
                    >
                      <span className="truncate">├── {tbl.name}</span>
                      <span className="text-[10px] text-[#6F757D]">{tbl.rowCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Area: Table Rows or Structure (9 cols) */}
          <div className="lg:col-span-9 p-5 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252930] pb-3">
              <div>
                <div className="font-mono text-sm font-semibold text-[#F1F3F4]">
                  public.{selectedTableMeta.name}
                </div>
                <div className="text-[#6F757D] font-mono text-[11px] mt-0.5">
                  {selectedTableMeta.rowCount} records · {selectedTableMeta.columns.length} columns · {selectedTableMeta.sizeBytes}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center p-0.5 bg-[#101216] border border-[#252930] rounded-[4px] text-xs">
                  <button
                    onClick={() => setExplorerTab('DATA')}
                    className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer ${
                      explorerTab === 'DATA'
                        ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                        : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
                    }`}
                  >
                    Rows ({tableData.length})
                  </button>
                  <button
                    onClick={() => setExplorerTab('STRUCTURE')}
                    className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer ${
                      explorerTab === 'STRUCTURE'
                        ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                        : 'text-[#9AA0A6] hover:text-[#F1F3F4]'
                    }`}
                  >
                    Columns & Schema
                  </button>
                </div>

                {explorerTab === 'DATA' && (
                  <button
                    onClick={() => setIsAddRowOpen(true)}
                    className="px-3 py-1 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert</span>
                  </button>
                )}
              </div>
            </div>

            {/* DATA TAB */}
            {explorerTab === 'DATA' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[#9AA0A6]" />
                  <input
                    type="text"
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    placeholder="Search rows..."
                    className="w-full bg-[#101216] border border-[#252930] rounded-[4px] px-2.5 py-1 text-xs text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8]"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#252930] text-[11px] text-[#9AA0A6]">
                        {selectedTableMeta.columns.map((col) => (
                          <th key={col.name} className="py-2 px-3 whitespace-nowrap">
                            <span className={col.isPrimaryKey ? 'text-[#8AB4F8] font-semibold' : ''}>
                              {col.name}
                            </span>
                            <span className="text-[9px] text-[#6F757D] block">{col.type}</span>
                          </th>
                        ))}
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F232B]">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={selectedTableMeta.columns.length + 1} className="py-8 text-center text-[#6F757D]">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((row, idx) => {
                          const pkVal = String(row[primaryKeyCol] || idx);
                          return (
                            <tr key={pkVal} className="hover:bg-[#101216]">
                              {selectedTableMeta.columns.map((col) => (
                                <td key={col.name} className="py-2 px-3 max-w-xs truncate text-[#F1F3F4]">
                                  {row[col.name] !== undefined && row[col.name] !== null
                                    ? String(row[col.name])
                                    : <span className="text-[#6F757D] italic">null</span>}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteRecord(pkVal)}
                                  className="text-[#6F757D] hover:text-[#F28B82] p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STRUCTURE TAB */}
            {explorerTab === 'STRUCTURE' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#252930] text-[11px] uppercase text-[#9AA0A6]">
                        <th className="py-2 px-3">Column</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Nullable</th>
                        <th className="py-2 px-3">Primary Key</th>
                        <th className="py-2 px-3">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F232B]">
                      {selectedTableMeta.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-[#101216]">
                          <td className="py-2 px-3 text-[#F1F3F4] font-medium">{col.name}</td>
                          <td className="py-2 px-3 text-[#8AB4F8]">{col.type}</td>
                          <td className="py-2 px-3 text-[#9AA0A6]">{col.nullable ? 'YES' : 'NO'}</td>
                          <td className="py-2 px-3">
                            {col.isPrimaryKey ? (
                              <span className="text-[#FDD663] text-[11px]">PRI</span>
                            ) : (
                              <span className="text-[#6F757D]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[#6F757D]">{col.defaultValue || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ACCESS ROLES VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'USERS' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#252930]">
            <div>
              <h2 className="text-base font-semibold text-[#F1F3F4]">
                Database Access Roles
              </h2>
              <p className="text-xs text-[#9AA0A6] mt-0.5">
                Active PostgreSQL roles and pool connection grants.
              </p>
            </div>
            <button
              onClick={() => setIsAddDbUserOpen(true)}
              className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
            >
              + Create Role
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] uppercase text-[#9AA0A6]">
                  <th className="py-2.5 px-3">Role / Username</th>
                  <th className="py-2.5 px-3">Role Type</th>
                  <th className="py-2.5 px-3">Permissions</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {databaseUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#101216]">
                    <td className="py-3 px-3 font-medium text-[#F1F3F4]">
                      {user.username}
                    </td>
                    <td className="py-3 px-3 text-[#8AB4F8]">{user.role}</td>
                    <td className="py-3 px-3 text-[#9AA0A6]">{user.permissions.join(', ')}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={user.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[#6F757D]">
                      {user.lastActivity.includes('T') ? new Date(user.lastActivity).toLocaleTimeString() : user.lastActivity}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toggleDatabaseUserStatus(user.id)}
                        className={`cursor-pointer ${
                          user.status === 'ACTIVE'
                            ? 'text-[#F28B82] hover:underline'
                            : 'text-[#81C995] hover:underline'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MIGRATIONS VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeSubTab === 'MIGRATIONS' && (
        <div className="space-y-4 text-xs">
          <div className="pb-2 border-b border-[#252930]">
            <h2 className="text-base font-semibold text-[#F1F3F4]">
              Migrations History
            </h2>
            <p className="text-xs text-[#9AA0A6] mt-0.5">
              Flyway DDL version control and schema partitions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#252930] text-[11px] uppercase text-[#9AA0A6]">
                  <th className="py-2.5 px-3">Migration ID</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Applied At</th>
                  <th className="py-2.5 px-3">Applied By</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232B]">
                {migrations.map((m) => (
                  <tr key={m.id} className="hover:bg-[#101216]">
                    <td className="py-3 px-3 text-[#8AB4F8] font-medium">{m.id}</td>
                    <td className="py-3 px-3 text-[#F1F3F4]">v{m.version}</td>
                    <td className="py-3 px-3 text-[#F1F3F4] max-w-sm truncate">{m.description}</td>
                    <td className="py-3 px-3 text-[#6F757D]">
                      {m.appliedAt.includes('T') ? new Date(m.appliedAt).toLocaleString() : m.appliedAt}
                    </td>
                    <td className="py-3 px-3 text-[#9AA0A6]">{m.appliedBy}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right space-x-3">
                      <button
                        onClick={() => setActiveViewMigration(m)}
                        className="text-[#8AB4F8] hover:underline cursor-pointer"
                      >
                        View SQL
                      </button>
                      {m.status === 'PENDING' && (
                        <button
                          onClick={() => handleApplyMigration(m)}
                          className="text-[#81C995] hover:underline cursor-pointer"
                        >
                          Apply
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL Snippet Modal */}
      {activeViewMigration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-xl bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <div>
                <h3 className="text-sm font-semibold text-[#8AB4F8]">{activeViewMigration.id}</h3>
                <span className="text-[#9AA0A6] text-[11px]">{activeViewMigration.description}</span>
              </div>
              <button onClick={() => setActiveViewMigration(null)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-[4px] bg-[#0B0C0E] border border-[#252930] text-[#8AB4F8] overflow-x-auto text-[11px]">
              <pre className="whitespace-pre-wrap">{`-- Migration ID: ${activeViewMigration.id}\n-- Version: ${activeViewMigration.version}\n-- Description: ${activeViewMigration.description}\n-- Status: ${activeViewMigration.status}\n-- Applied At: ${activeViewMigration.appliedAt}\n${activeViewMigration.checksum ? `-- Checksum: ${activeViewMigration.checksum}\n` : ''}`}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveViewMigration(null)}
                className="px-3.5 py-1.5 rounded-[4px] bg-[#15181D] hover:bg-[#1A1D22] border border-[#252930] text-[#F1F3F4]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Row Modal */}
      {isAddRowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <h3 className="text-sm font-semibold text-[#F1F3F4]">
                Insert into public.{selectedTableMeta.name}
              </h3>
              <button onClick={() => setIsAddRowOpen(false)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertSubmit} className="space-y-3">
              {selectedTableMeta.columns.map((col) => (
                <div key={col.name}>
                  <label className="block text-[#9AA0A6] mb-1">
                    {col.name} ({col.type}) {col.isPrimaryKey && <span className="text-[#8AB4F8]">*PK</span>}
                  </label>
                  <input
                    type="text"
                    required={col.isPrimaryKey || !col.nullable}
                    defaultValue={col.isPrimaryKey ? `${col.name.slice(0, 3)}_${Date.now()}` : ''}
                    onChange={(e) => setNewRowPayload({ ...newRowPayload, [col.name]: e.target.value })}
                    className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setIsAddRowOpen(false)}
                  className="px-3.5 py-1.5 text-[#9AA0A6] hover:text-[#F1F3F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] cursor-pointer"
                >
                  Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create DB User Modal */}
      {isAddDbUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-6 text-[#F1F3F4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252930]">
              <h3 className="text-sm font-semibold text-[#F1F3F4]">Create Database Role</h3>
              <button onClick={() => setIsAddDbUserOpen(false)} className="text-[#9AA0A6] hover:text-[#F1F3F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDbUser} className="space-y-4">
              <div>
                <label className="block text-[#9AA0A6] mb-1">ROLE USERNAME *</label>
                <input
                  type="text"
                  required
                  value={newDbUsername}
                  onChange={(e) => setNewDbUsername(e.target.value)}
                  placeholder="e.g. voiceshield_worker"
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4]"
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] mb-1">GRANT ROLE</label>
                <select
                  value={newDbRole}
                  onChange={(e) => setNewDbRole(e.target.value as any)}
                  className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-2.5 py-1.5 text-[#F1F3F4]"
                >
                  <option value="voiceshield_writer">voiceshield_writer (DML CRUD)</option>
                  <option value="voiceshield_reader">voiceshield_reader (Read Only)</option>
                  <option value="migration_runner">migration_runner (DDL owner)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#252930]">
                <button
                  type="button"
                  onClick={() => setIsAddDbUserOpen(false)}
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
    </div>
  );
};
