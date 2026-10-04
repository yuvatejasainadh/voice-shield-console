import React from 'react';
import { WorkStatus, TestStatus, TestOutcome } from '../../types';

interface StatusBadgeProps {
  status:
    | WorkStatus
    | TestStatus
    | TestOutcome
    | 'ACTIVE'
    | 'INACTIVE'
    | 'AVAILABLE'
    | 'MAINTENANCE'
    | 'COMPLETED'
    | 'PENDING'
    | 'SUBMITTED'
    | 'CHANGES_REQUESTED'
    | 'APPROVED'
    | 'DRAFT'
    | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  // Dot color matching the spec
  let dotColor = '#9AA0A6'; // default neutral
  let labelColor = 'text-[#F1F3F4]';

  if (['APPROVED', 'PASS', 'ACTIVE', 'AVAILABLE', 'COMPLETED', 'SUCCESS'].includes(normalized)) {
    dotColor = '#81C995'; // Success green
  } else if (
    ['IN_PROGRESS', 'ACCEPTED', 'UNDER_REVIEW', 'SUBMITTED', 'DOCUMENTATION_SUBMITTED', 'PROCESSING'].includes(
      normalized
    )
  ) {
    dotColor = '#8AB4F8'; // Primary blue
  } else if (
    ['CHANGES_REQUESTED', 'RE_TEST_REQUIRED', 'WARNING', 'MAINTENANCE', 'MIGRATION_PENDING', 'PENDING', 'DOC_REVIEW', 'BLOCKED'].includes(
      normalized
    )
  ) {
    dotColor = '#FDD663'; // Warning amber
  } else if (
    ['FAIL', 'REJECTED', 'INACTIVE', 'DISABLED', 'FAILED', 'CLOSED', 'DENIED', 'CRITICAL'].includes(
      normalized
    )
  ) {
    dotColor = '#F28B82'; // Error red
  } else if (['DRAFT', 'NOT_TESTED', 'ASSIGNED'].includes(normalized)) {
    dotColor = '#6F757D'; // Muted gray
    labelColor = 'text-[#9AA0A6]';
  }

  // Format label
  const formatLabel = (val: string) => {
    switch (val) {
      case 'DOCUMENTATION_SUBMITTED':
        return 'Doc Submitted';
      case 'CHANGES_REQUESTED':
        return 'Changes Req.';
      case 'RE_TEST_REQUIRED':
        return 'Re-test Req.';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'NOT_TESTED':
        return 'Not Tested';
      case 'DOC_REVIEW':
        return 'Doc Review';
      default:
        // Capitalize first letter of each word
        return val
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const textSize = size === 'sm' ? 'text-[12px]' : 'text-[13px]';

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} font-normal ${labelColor} whitespace-nowrap`}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span>{formatLabel(normalized)}</span>
    </span>
  );
};
