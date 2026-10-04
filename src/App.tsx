/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConsoleProvider, useConsole } from './context/ConsoleContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { ConfirmDialog } from './components/common/ConfirmDialog';

import { LoginView } from './components/pages/LoginView';
import { OverviewView } from './components/pages/OverviewView';
import { WorkView } from './components/pages/WorkView';
import { TestingView } from './components/pages/TestingView';
import { QuickTestWizard } from './components/pages/QuickTestWizard';
import { DevicesView } from './components/pages/DevicesView';
import { DocReviewView } from './components/pages/DocReviewView';
import { DeveloperDocView } from './components/pages/DeveloperDocView';
import { DatabaseView } from './components/pages/DatabaseView';
import { ExportsView } from './components/pages/ExportsView';
import { AuditLogsView } from './components/pages/AuditLogsView';
import { TeamView } from './components/pages/TeamView';
import { SettingsView } from './components/pages/SettingsView';

const MainConsoleShell: React.FC = () => {
  const { isAuthenticated, currentRoute } = useConsole();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveRoute = () => {
    switch (currentRoute) {
      case 'overview':
        return <OverviewView />;
      case 'work':
        return <WorkView />;
      case 'testing':
        return <TestingView />;
      case 'quick-test':
        return <QuickTestWizard />;
      case 'devices':
        return <DevicesView />;
      case 'reviews':
        return <DocReviewView />;
      case 'documentation':
        return <DeveloperDocView />;
      case 'database':
        return <DatabaseView />;
      case 'exports':
        return <ExportsView />;
      case 'audit':
        return <AuditLogsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0C0E] text-[#F1F3F4] overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0B0C0E]">
          {renderActiveRoute()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <NotificationDrawer />
      <ConfirmDialog />
    </div>
  );
};

export default function App() {
  return (
    <ConsoleProvider>
      <MainConsoleShell />
    </ConsoleProvider>
  );
}
