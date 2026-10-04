import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Cpu,
  Server,
  Save,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const SettingsView: React.FC = () => {
  const { currentRole } = useConsole();
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('60');
  const [requireMfaAllPrivileged, setRequireMfaAllPrivileged] = useState(true);
  const [immutableAuditLogRetentionDays, setImmutableAuditLogRetentionDays] = useState('365');
  const [audioFingerprintMatchThreshold, setAudioFingerprintMatchThreshold] = useState('0.85');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider mb-1">
            CONFIGURATION / SYSTEM
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F3F4] tracking-tight">
            Console Settings
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1">
            Security policies, hardware evaluation parameters, session policies, and cluster configuration.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 bg-[#8AB4F8] hover:bg-[#A8C7FA] text-[#0B0C0E] font-medium rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-[4px] bg-[#101216] border border-[#252930] text-[#81C995] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#81C995] shrink-0" />
          <span>Console configuration saved successfully.</span>
        </div>
      )}

      {/* Security & Access Policies */}
      <div className="p-5 rounded-[4px] bg-[#101216] border border-[#252930] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F1F3F4] font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#8AB4F8]" />
          <span>Security & Authentication Governance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Console Session Inactivity Timeout
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(e.target.value)}
                className="w-28 bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-1.5 text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
              />
              <span className="text-[#6F757D]">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Audit Log Retention Horizon
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={immutableAuditLogRetentionDays}
                onChange={(e) => setImmutableAuditLogRetentionDays(e.target.value)}
                className="w-28 bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-1.5 text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
              />
              <span className="text-[#6F757D]">days (Immutable pg_partman)</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-[#9AA0A6] hover:text-[#F1F3F4] cursor-pointer">
            <input
              type="checkbox"
              checked={requireMfaAllPrivileged}
              onChange={(e) => setRequireMfaAllPrivileged(e.target.checked)}
              className="rounded-[2px] border-[#252930] bg-[#0B0C0E] text-[#8AB4F8]"
            />
            <span>Enforce Hardware TOTP MFA for SUPER_ADMIN & ADMIN accounts on privileged DDL actions</span>
          </label>
        </div>
      </div>

      {/* Model & Detection Invariants */}
      <div className="p-5 rounded-[4px] bg-[#101216] border border-[#252930] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F1F3F4] font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#8AB4F8]" />
          <span>Acoustic Engine Evaluation Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Scam Speech Pattern Confidence Threshold
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={audioFingerprintMatchThreshold}
                onChange={(e) => setAudioFingerprintMatchThreshold(e.target.value)}
                className="w-28 bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-1.5 text-[#F1F3F4] focus:outline-hidden focus:border-[#8AB4F8]"
              />
              <span className="text-[#6F757D] font-mono">(0.00 – 1.00 float score)</span>
            </div>
            <p className="text-[11px] text-[#6F757D] mt-1">
              Test sessions with confidence below this target require mandatory re-test.
            </p>
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-[11px] font-mono uppercase mb-1">
              Target Classification Latency SLA
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled
                value="3500 ms"
                className="w-28 bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-1.5 text-[#6F757D] cursor-not-allowed font-mono"
              />
              <span className="text-[#6F757D]">P99 hard upper bound</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure & RDS Metadata */}
      <div className="p-5 rounded-[4px] bg-[#101216] border border-[#252930] space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F1F3F4] font-mono flex items-center gap-2">
          <Server className="w-4 h-4 text-[#8AB4F8]" />
          <span>System Environment & Cluster Build</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 rounded-[2px] bg-[#0B0C0E] border border-[#252930]">
            <span className="text-[#6F757D] block text-[10px] font-mono uppercase">APPLICATION</span>
            <span className="text-[#F1F3F4] font-medium">VoiceShield Console</span>
          </div>
          <div className="p-3 rounded-[2px] bg-[#0B0C0E] border border-[#252930]">
            <span className="text-[#6F757D] block text-[10px] font-mono uppercase">BUILD RELEASE</span>
            <span className="text-[#8AB4F8] font-mono font-medium">v1.0.0-prod</span>
          </div>
          <div className="p-3 rounded-[2px] bg-[#0B0C0E] border border-[#252930]">
            <span className="text-[#6F757D] block text-[10px] font-mono uppercase">RDS REGION</span>
            <span className="text-[#F1F3F4] font-mono">ap-south-1</span>
          </div>
          <div className="p-3 rounded-[2px] bg-[#0B0C0E] border border-[#252930]">
            <span className="text-[#6F757D] block text-[10px] font-mono uppercase">ENGINE SPEC</span>
            <span className="text-[#F1F3F4] font-mono">PostgreSQL 16.3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
