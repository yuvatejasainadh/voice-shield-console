import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronDown, Check, Terminal } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const Header: React.FC = () => {
  const {
    currentRoute,
    selectedWorkId,
    selectedTestId,
    currentUser,
    users,
    switchUser,
    notifications,
    setIsCommandPaletteOpen,
    setIsNotificationOpen,
  } = useConsole();

  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBreadcrumbs = () => {
    const parts = ['VoiceShield Console', 'Operations'];
    const routeTitles: Record<string, string> = {
      overview: 'Overview',
      work: 'Work',
      testing: 'Testing',
      'quick-test': 'Quick Test',
      devices: 'Devices',
      reviews: 'Reviews',
      documentation: 'Documentation',
      database: 'PostgreSQL RDS',
      exports: 'Exports',
      audit: 'Audit Logs',
      team: 'Team',
      settings: 'Settings',
    };

    parts.push(routeTitles[currentRoute] || currentRoute);

    if (currentRoute === 'work' && selectedWorkId) {
      parts.push(selectedWorkId);
    } else if (currentRoute === 'testing' && selectedTestId) {
      parts.push(selectedTestId);
    }

    return parts;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-[#0A0B0D] border-b border-[#252930] px-4 flex items-center justify-between z-20 shrink-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2.5 text-xs text-[#9AA0A6] min-w-0">
        <Shield className="w-3.5 h-3.5 text-[#8AB4F8] shrink-0" />
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <span className="text-[#6F757D]">/</span>}
              <span
                className={`${
                  idx === breadcrumbs.length - 1
                    ? 'text-[#F1F3F4] font-medium'
                    : 'text-[#9AA0A6]'
                }`}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-[4px] bg-[#0B0C0E] hover:bg-[#101216] border border-[#252930] text-xs text-[#6F757D] hover:text-[#9AA0A6] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#9AA0A6]" />
            <span className="font-normal text-[#6F757D]">
              Search work, tests, devices, users...
            </span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#15181D] text-[#9AA0A6] rounded-[2px] border border-[#252930]">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Environment, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Environment Info */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#9AA0A6]">
          <span>ENV:</span>
          <span className="text-[#8AB4F8] font-medium">INTERNAL</span>
          <span className="text-[#252930]">|</span>
          <span>REGION:</span>
          <span className="text-[#F1F3F4]">AP-SOUTH-1</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-1.5 text-[#9AA0A6] hover:text-[#F1F3F4] rounded-[2px] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#8AB4F8]" />
          )}
        </button>

        {/* User Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-[4px] hover:bg-[#15181D] border border-transparent hover:border-[#252930] text-xs text-[#F1F3F4] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#252930] text-[#F1F3F4] flex items-center justify-center font-mono text-[11px] font-medium">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline font-normal">{currentUser?.name || 'Operator'}</span>
            <ChevronDown className="w-3 h-3 text-[#9AA0A6]" />
          </button>

          {roleSwitcherOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl py-2 z-50 text-xs"
              onClick={() => setRoleSwitcherOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-[#6F757D] border-b border-[#252930]">
                Operator Directory
              </div>
              <div className="p-1 space-y-0.5">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[2px] text-left transition-colors cursor-pointer ${
                      currentUser?.id === user.id
                        ? 'bg-[#15181D] text-[#8AB4F8] font-medium'
                        : 'text-[#F1F3F4] hover:bg-[#1A1D22]'
                    }`}
                  >
                    <div>
                      <div className="font-normal text-[#F1F3F4]">{user.name}</div>
                      <div className="text-[10px] text-[#9AA0A6] font-mono">
                        {user.role.replace('_', ' ')}
                      </div>
                    </div>
                    {currentUser?.id === user.id && (
                      <Check className="w-3.5 h-3.5 text-[#8AB4F8]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="px-3 pt-2 pb-1 text-[10px] text-[#6F757D] font-mono border-t border-[#252930]">
                Switches view context across backend roles.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
