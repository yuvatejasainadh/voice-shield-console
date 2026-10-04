import React, { useState, useEffect, useRef } from 'react';
import { Search, Briefcase, FlaskConical, Smartphone, FileText, Users, ArrowRight, X } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    workItems,
    testSessions,
    devices,
    docs,
    users,
    navigate,
  } = useConsole();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.trim().toLowerCase();

  // Search categories
  const matchingWork = workItems
    .filter((w) => !q || w.id.toLowerCase().includes(q) || w.title.toLowerCase().includes(q) || w.status.toLowerCase().includes(q))
    .slice(0, 4)
    .map((item) => ({
      category: 'WORK',
      id: item.id,
      title: `${item.id} — ${item.title}`,
      subtitle: `${item.priority} · ${item.status} · Assigned to ${item.assigneeName}`,
      icon: Briefcase,
      action: () => {
        navigate('work', { workId: item.id });
        setIsCommandPaletteOpen(false);
      },
    }));

  const matchingTests = testSessions
    .filter((t) => !q || t.id.toLowerCase().includes(q) || t.scenarioName.toLowerCase().includes(q) || t.deviceName.toLowerCase().includes(q))
    .slice(0, 4)
    .map((item) => ({
      category: 'TEST',
      id: item.id,
      title: `${item.id} — ${item.scenarioName}`,
      subtitle: `${item.deviceName} · ${item.outcome} · ${item.status}`,
      icon: FlaskConical,
      action: () => {
        navigate('testing', { testId: item.id });
        setIsCommandPaletteOpen(false);
      },
    }));

  const matchingDevices = devices
    .filter((d) => !q || d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.modelNumber.toLowerCase().includes(q))
    .slice(0, 3)
    .map((item) => ({
      category: 'DEVICE',
      id: item.id,
      title: `${item.name} (${item.modelNumber})`,
      subtitle: `${item.manufacturer} · ${item.status} · ${item.androidVersion}`,
      icon: Smartphone,
      action: () => {
        navigate('devices', { deviceId: item.id });
        setIsCommandPaletteOpen(false);
      },
    }));

  const matchingDocs = docs
    .filter((d) => !q || d.id.toLowerCase().includes(q) || d.workTitle.toLowerCase().includes(q) || d.authorName.toLowerCase().includes(q))
    .slice(0, 3)
    .map((item) => ({
      category: 'DOCUMENTATION',
      id: item.id,
      title: `${item.id} — ${item.workTitle}`,
      subtitle: `By ${item.authorName} · v${item.version} · ${item.status}`,
      icon: FileText,
      action: () => {
        navigate('reviews', { docId: item.id });
        setIsCommandPaletteOpen(false);
      },
    }));

  const matchingUsers = users
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
    .slice(0, 3)
    .map((item) => ({
      category: 'USER',
      id: item.id,
      title: `${item.name} (${item.role.replace('_', ' ')})`,
      subtitle: `${item.email} · Status: ${item.status}`,
      icon: Users,
      action: () => {
        navigate('team');
        setIsCommandPaletteOpen(false);
      },
    }));

  const allResults = [
    ...matchingWork,
    ...matchingTests,
    ...matchingDevices,
    ...matchingDocs,
    ...matchingUsers,
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-2xs"
      onClick={() => setIsCommandPaletteOpen(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl overflow-hidden flex flex-col max-h-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0B0C0E] border-b border-[#252930]">
          <Search className="w-4 h-4 text-[#8AB4F8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search work, tests (TS-2001), devices, docs, users..."
            className="w-full bg-transparent text-xs text-[#F1F3F4] placeholder:text-[#6F757D] outline-hidden font-mono"
          />
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-[#6F757D] font-mono">
            <kbd className="px-1.5 py-0.5 bg-[#15181D] rounded-[2px] border border-[#252930] text-[#9AA0A6]">ESC</kbd>
          </div>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-[#6F757D] hover:text-[#F1F3F4] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-[#1F232B] p-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6F757D] font-mono">
              No matching resources found for query: "{query}"
            </div>
          ) : (
            allResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-[2px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#15181D] text-[#F1F3F4]'
                      : 'hover:bg-[#15181D]/60 text-[#9AA0A6]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-1 rounded-[2px] bg-[#15181D] border border-[#252930] text-[#8AB4F8] shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded-[2px] bg-[#0B0C0E] text-[#6F757D] border border-[#252930]">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-medium text-[#F1F3F4] truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#6F757D] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8AB4F8]' : 'text-[#6F757D]'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0A0B0D] border-t border-[#252930] text-[10px] text-[#6F757D] font-mono">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>VoiceShield Control Plane Search</span>
        </div>
      </div>
    </div>
  );
};
