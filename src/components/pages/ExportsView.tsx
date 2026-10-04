import React, { useState } from 'react';
import {
  DownloadCloud,
  FileDown,
  CheckCircle2,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';
import { StatusBadge } from '../common/StatusBadge';

export const ExportsView: React.FC = () => {
  const {
    exports,
    databaseTables,
    generateExport,
    openConfirmDialog,
  } = useConsole();

  const [selectedFormat, setSelectedFormat] = useState<'SQL' | 'CSV' | 'JSON'>('SQL');
  const [selectedTables, setSelectedTables] = useState<string[]>([
    'users',
    'work_items',
    'tests',
    'audit_logs',
  ]);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  const toggleTable = (tblName: string) => {
    if (selectedTables.includes(tblName)) {
      setSelectedTables(selectedTables.filter((t) => t !== tblName));
    } else {
      setSelectedTables([...selectedTables, tblName]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTables.length === databaseTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(databaseTables.map((t) => t.name));
    }
  };

  const handleGenerateExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTables.length === 0) return;

    openConfirmDialog({
      title: 'Generate Database Dump',
      actionName: 'GENERATE_DATABASE_EXPORT',
      resourceDetails: `Format: ${selectedFormat} · Tables: [${selectedTables.join(', ')}]`,
      warningNote:
        'This dumps production records into an encrypted artifact. Export generation and downloads are recorded in immutable audit logs.',
      confirmButtonText: 'Generate Export',
      onConfirm: () => {
        generateExport(selectedFormat, selectedTables);
      },
    });
  };

  const handleSimulateDownload = (exportId: string, format: string) => {
    setDownloadSuccessNotice(`Initiated secure download for ${exportId}.${format.toLowerCase()}`);
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            INFRASTRUCTURE / DATA GOVERNANCE
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Database Exports
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Privileged schema dumps, audit tables, and encrypted archive history.
          </p>
        </div>
      </div>

      {downloadSuccessNotice && (
        <div className="p-3 rounded-[4px] bg-[#101216] border border-[#252930] text-[#81C995] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* Export Form */}
      <div className="p-5 rounded-[4px] bg-[#101216] border border-[#252930] space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#252930]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA0A6]">
            Configure Database Dump
          </span>
          <span className="text-[#6F757D] font-mono text-[11px]">
            Database: voiceshield (public)
          </span>
        </div>

        <form onSubmit={handleGenerateExport} className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[#9AA0A6] text-[11px] font-mono uppercase">FORMAT:</span>
            <div className="flex gap-2">
              {(['SQL', 'CSV', 'JSON'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 rounded-[2px] border text-xs font-mono transition-colors cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-[#15181D] text-[#8AB4F8] border-[#8AB4F8] font-medium'
                      : 'bg-[#0B0C0E] text-[#9AA0A6] border-[#252930] hover:text-[#F1F3F4]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9AA0A6] text-[11px] font-mono uppercase">
                Tables to include:
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-[#8AB4F8] hover:underline"
              >
                {selectedTables.length === databaseTables.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {databaseTables.map((tbl) => {
                const isChecked = selectedTables.includes(tbl.name);
                return (
                  <div
                    key={tbl.name}
                    onClick={() => toggleTable(tbl.name)}
                    className={`p-2.5 rounded-[2px] border cursor-pointer transition-colors flex items-center justify-between text-xs font-mono ${
                      isChecked
                        ? 'bg-[#15181D] border-[#8AB4F8] text-[#F1F3F4]'
                        : 'bg-[#0B0C0E] border-[#252930] text-[#6F757D] hover:text-[#9AA0A6]'
                    }`}
                  >
                    <span>{tbl.name}</span>
                    <span className="text-[10px] text-[#6F757D]">{tbl.rowCount}r</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#252930]">
            <span className="text-[11px] text-[#6F757D] font-mono">
              Selected: {selectedTables.length} tables · Format: {selectedFormat}
            </span>
            <button
              type="submit"
              disabled={selectedTables.length === 0}
              className="px-4 py-1.5 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] disabled:opacity-40 text-[#0B0C0E] font-medium text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Generate Export</span>
            </button>
          </div>
        </form>
      </div>

      {/* Clean Table (as specified in Section 22) */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#F1F3F4]">
          Export Archive
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252930] text-[11px] font-mono uppercase text-[#9AA0A6] tracking-wider">
                <th className="py-2.5 px-3">EXPORT ID</th>
                <th className="py-2.5 px-3">FORMAT</th>
                <th className="py-2.5 px-3">REQUESTED BY</th>
                <th className="py-2.5 px-3">TABLES</th>
                <th className="py-2.5 px-3">SIZE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">CREATED</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232B]">
              {exports.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#101216] transition-colors">
                  <td className="py-3 px-3 font-mono text-[#8AB4F8] font-medium">
                    {exp.id}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#9AA0A6]">
                    {exp.format}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4]">
                    {exp.requestedByName}
                  </td>
                  <td className="py-3 px-3 text-[#9AA0A6] font-mono text-[11px] max-w-xs truncate">
                    {exp.tables.join(', ')}
                  </td>
                  <td className="py-3 px-3 text-[#F1F3F4] font-mono">
                    {exp.fileSize}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={exp.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[#6F757D] font-mono">
                    {getRelativeTime(exp.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleSimulateDownload(exp.id, exp.format)}
                      className="text-[#8AB4F8] hover:underline flex items-center gap-1 ml-auto cursor-pointer font-mono"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
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
