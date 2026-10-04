import React from 'react';
import {
  Home,
  Briefcase,
  FlaskConical,
  Smartphone,
  CheckSquare,
  FileCode2,
  Database,
  DownloadCloud,
  ShieldCheck,
  Users2,
  Settings as SettingsIcon,
  LogOut,
  Shield,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const Sidebar: React.FC = () => {
  const { currentUser, currentRole, currentRoute, navigate, logout, testSessions, docs } = useConsole();

  // Review badge counts
  const pendingTestReviews = testSessions.filter((t) => t.status === 'UNDER_REVIEW' || t.status === 'SUBMITTED').length;
  const pendingDocReviews = docs.filter((d) => d.status === 'SUBMITTED').length;
  const totalPendingReviews = pendingTestReviews + pendingDocReviews;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER', 'TESTER'],
    },
    {
      id: 'work',
      label: 'Work',
      icon: Briefcase,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
    },
    {
      id: 'testing',
      label: 'Testing',
      icon: FlaskConical,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER', 'TESTER'],
    },
    {
      id: 'devices',
      label: 'Devices',
      icon: Smartphone,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: CheckSquare,
      badge: totalPendingReviews > 0 ? totalPendingReviews : undefined,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: FileCode2,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'],
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: DownloadCloud,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER', 'TESTER'],
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users2,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER', 'TESTER'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-[220px] bg-[#090A0C] border-r border-[#252930] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#252930]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 text-[#8AB4F8] flex items-center justify-center">
            <Shield className="w-4 h-4 fill-[#8AB4F8]/20 stroke-[#8AB4F8]" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-wider text-[#F1F3F4] uppercase font-mono leading-none">
              VOICESHIELD
            </div>
            <div className="text-[11px] text-[#9AA0A6] font-normal leading-tight">
              Console
            </div>
          </div>
        </div>
        <div className="px-1.5 py-0.5 rounded-[2px] bg-[#15181D] border border-[#252930] text-[10px] font-mono text-[#9AA0A6]">
          v1.0
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] font-normal transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#15181D] text-[#F1F3F4] font-medium border-l-2 border-[#8AB4F8]'
                  : 'text-[#9AA0A6] hover:text-[#F1F3F4] hover:bg-[#101216]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#8AB4F8]' : 'text-[#9AA0A6]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-[2px] bg-[#15181D] text-[#9AA0A6] border border-[#252930]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Sidebar: Status and User Info */}
      <div className="p-3 border-t border-[#252930] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono px-1">
          <div className="flex items-center gap-1.5 text-[#9AA0A6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#81C995]" />
            <span>INTERNAL</span>
          </div>
          <span className="text-[#6F757D]">AP-SOUTH-1</span>
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#15181D] border border-[#252930] text-[#F1F3F4] flex items-center justify-center font-mono font-medium text-xs shrink-0">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#F1F3F4] truncate">
                {currentUser?.name || 'Operator'}
              </div>
              <div className="text-[10px] text-[#9AA0A6] font-mono capitalize">
                {(currentUser?.role || currentRole).toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-[#6F757D] hover:text-[#F1F3F4] rounded-[2px] transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
