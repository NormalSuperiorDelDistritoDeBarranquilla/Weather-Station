import { Outlet } from 'react-router-dom'
import { useState } from 'react'

import { Footer } from '../components/Footer'
import { FloatingAlerts } from '../components/FloatingAlerts'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <FloatingAlerts />
      <div className="min-h-screen lg:pl-80">
        <Navbar onMenuClick={() => setIsSidebarOpen((current) => !current)} />
        <main className="page-enter mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <div className="px-4 pb-8 sm:px-6 lg:px-8">
          <Footer compact />
        </div>
      </div>
    </div>
  )
}
