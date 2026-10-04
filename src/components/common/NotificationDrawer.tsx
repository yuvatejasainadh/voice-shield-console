import React from 'react';
import { Bell, CheckCheck, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    markNotificationRead,
    markAllNotificationsRead,
    navigate,
  } = useConsole();

  if (!isNotificationOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertCircle className="w-3.5 h-3.5 text-[#F28B82] shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#FDD663] shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle className="w-3.5 h-3.5 text-[#81C995] shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#8AB4F8] shrink-0" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
      onClick={() => setIsNotificationOpen(false)}
    >
      <div
        className="w-full max-w-sm h-full bg-[#0A0B0D] border-l border-[#252930] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#090A0C] border-b border-[#252930]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8AB4F8]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F1F3F4] font-mono">
              Notifications ({unreadCount})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                title="Mark all as read"
                className="text-[11px] text-[#8AB4F8] hover:underline flex items-center gap-1 px-2 py-0.5 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="text-[#9AA0A6] hover:text-[#F1F3F4] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1F232B] p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#6F757D] font-mono">
              No recent notifications.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.targetRoute) {
                    navigate(notif.targetRoute);
                    setIsNotificationOpen(false);
                  }
                }}
                className={`p-3 rounded-[2px] cursor-pointer transition-colors text-xs flex gap-2.5 ${
                  notif.read
                    ? 'bg-transparent text-[#9AA0A6] hover:bg-[#101216]'
                    : 'bg-[#101216] border border-[#252930] hover:bg-[#15181D]'
                }`}
              >
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-medium text-[#F1F3F4] truncate">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8AB4F8] shrink-0" />
                    )}
                  </div>
                  <p className="text-[#9AA0A6] text-[11px] leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="text-[10px] text-[#6F757D] font-mono mt-1">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
