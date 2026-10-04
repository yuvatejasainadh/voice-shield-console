import React from 'react';
import { Role } from '../../types';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  let color = 'text-[#9AA0A6]';
  if (role === 'SUPER_ADMIN') {
    color = 'text-[#8AB4F8]';
  } else if (role === 'ADMIN') {
    color = 'text-[#9AA0A6]';
  } else if (role === 'DEVELOPER') {
    color = 'text-[#9AA0A6]';
  } else if (role === 'TESTER') {
    color = 'text-[#9AA0A6]';
  }

  const textSz = size === 'sm' ? 'text-[11px]' : 'text-[12px]';

  return (
    <span className={`inline-block font-mono ${textSz} ${color} whitespace-nowrap`}>
      {role.replace('_', ' ')}
    </span>
  );
};
