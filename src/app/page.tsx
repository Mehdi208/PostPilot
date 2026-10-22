'use client';

import React from 'react';
import { PostPilotProvider, usePostPilot } from '@/context/PostPilotContext';
import AppSidebar from '@/components/layout/AppSidebar';
import AppTopbar from '@/components/layout/AppTopbar';
import MonthCalendarView from '@/components/calendar/MonthCalendarView';
import ExcelTableView from '@/components/table/ExcelTableView';
import InspirationRadar from '@/components/inspiration/InspirationRadar';
import PostDetailModal from '@/components/post/PostDetailModal';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

function DashboardContent() {
  const { activeView } = usePostPilot();

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Nav (Desktop only) */}
      <AppSidebar />

      {/* Main Workspace Cockpit */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden pb-14 md:pb-0">
        {/* Topbar with Month header & filters */}
        <AppTopbar />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeView === 'calendar' && <MonthCalendarView />}
          {activeView === 'table' && <ExcelTableView />}
          {activeView === 'inspiration' && <InspirationRadar />}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileBottomNav />

      {/* Slide-over / Modal Detail Inspector */}
      <PostDetailModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <PostPilotProvider>
      <DashboardContent />
    </PostPilotProvider>
  );
}
