"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Playground } from '@/components/playground'
import { Homepage } from '@/components/homepage'
import { Projects } from '@/components/projects'
import { KnowledgeBase } from '@/components/knowledge-base'
import { QuickCreate } from '@/components/quick-create'
import { Settings } from '@/components/settings'
import { HelpSupport } from '@/components/help-support'
import { Discover } from '@/components/discover'
import { ProjectChat } from '@/components/project-chat'
import { DashboardProjectDetail } from '@/components/dashboard-project-detail'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AdminPage() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const getCurrentView = () => {
    if (currentPath.startsWith('/admin/chat/')) {
      return 'chat'
    } else if (currentPath === '/admin/settings') {
      return 'settings'
    } else if (currentPath === '/admin/help-support') {
      return 'help-support'
    } else if (currentPath === '/admin/discover') {
      return 'discover'
    } else if (currentPath.startsWith('/admin/projects/')) {
      return 'dashboard-project-detail'
    } else if (currentPath === '/admin/projects') {
      return 'projects'
    } else if (currentPath === '/admin/playground') {
      return 'playground'
    } else if (currentPath === '/admin/data-library') {
      return 'data-library'
    } else if (currentPath === '/admin/quick-create') {
      return 'quick-create'
    } else {
      return 'dashboard'
    }
  }

  const getProjectSlug = () => {
    if (currentPath.startsWith('/admin/chat/')) {
      return currentPath.replace('/admin/chat/', '')
    } else if (currentPath.startsWith('/admin/projects/')) {
      return currentPath.replace('/admin/projects/', '')
    }
    return ''
  }

  const currentView = getCurrentView()
  const projectSlug = getProjectSlug()

  return (
    <SidebarProvider>
      <AppSidebar 
        variant="inset" 
        currentView={currentView}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-50 bg-background rounded-t-xl overflow-hidden flex-shrink-0">
          <SiteHeader currentView={currentView} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {currentView === 'chat' ? (
            <ProjectChat projectSlug={projectSlug} />
          ) : currentView === 'dashboard-project-detail' ? (
            <DashboardProjectDetail 
              projectSlug={projectSlug} 
              onNavigate={handleNavigate}
            />
          ) : currentView === 'dashboard' ? (
            <Homepage />
          ) : currentView === 'playground' ? (
            <Playground />
          ) : currentView === 'projects' ? (
            <Projects />
          ) : currentView === 'data-library' ? (
            <KnowledgeBase />
          ) : currentView === 'quick-create' ? (
            <QuickCreate 
              onClose={() => handleNavigate('/admin')}
              onComplete={(projectSlug?: string) => handleNavigate(projectSlug ? `/admin/projects/${projectSlug}` : '/admin/playground')}
            />
          ) : currentView === 'settings' ? (
            <Settings />
          ) : currentView === 'help-support' ? (
            <HelpSupport />
          ) : currentView === 'discover' ? (
            <Discover />
          ) : (
            <Homepage />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}