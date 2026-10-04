import React from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useConsole();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xs">
      <div className="w-full max-w-lg bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl overflow-hidden text-[#F1F3F4]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#252930] bg-[#0A0B0D]">
          <div className="flex items-center gap-2.5 text-[#F1F3F4]">
            <Shield className="w-4 h-4 text-[#8AB4F8] shrink-0" />
            <span className="font-semibold text-xs tracking-wider uppercase font-mono">
              Privileged Confirmation
            </span>
          </div>
          <button
            onClick={closeConfirmDialog}
            className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F3F4] mb-1">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-[#9AA0A6] leading-relaxed">
              This is a privileged infrastructure operation. Administrative actions and mutations are recorded in the immutable audit log.
            </p>
          </div>

          <div className="bg-[#0B0C0E] border border-[#252930] rounded-[2px] p-3 font-mono text-xs space-y-1.5 text-[#9AA0A6]">
            <div className="flex">
              <span className="text-[#6F757D] w-20 shrink-0">ACTION:</span>
              <span className="text-[#F1F3F4] font-medium">{confirmDialog.actionName}</span>
            </div>
            <div className="flex">
              <span className="text-[#6F757D] w-20 shrink-0">TARGET:</span>
              <span className="text-[#9AA0A6] break-all">{confirmDialog.resourceDetails}</span>
            </div>
            <div className="flex">
              <span className="text-[#6F757D] w-20 shrink-0">LEVEL:</span>
              <span className="text-[#8AB4F8]">PRIVILEGED_ROLE</span>
            </div>
          </div>

          {confirmDialog.warningNote && (
            <div className="p-3 rounded-[2px] bg-[#15181D] border-l-2 border-[#FDD663] text-xs text-[#9AA0A6] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FDD663] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{confirmDialog.warningNote}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-[#0A0B0D] border-t border-[#252930]">
          <button
            onClick={closeConfirmDialog}
            className="px-3.5 py-1.5 text-xs text-[#9AA0A6] hover:text-[#F1F3F4] rounded-[4px] border border-[#252930] hover:bg-[#15181D] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-medium text-[#0B0C0E] bg-[#F28B82] hover:bg-[#F6AEA9] rounded-[4px] transition-colors cursor-pointer"
          >
            {confirmDialog.confirmButtonText || 'Confirm Operation'}
          </button>
        </div>
      </div>
    </div>
  );
};
