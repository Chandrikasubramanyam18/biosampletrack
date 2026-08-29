import { useLocation } from 'react-router-dom'
import { Bell, UserCircle } from 'lucide-react'
import './Navbar.css'

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/samples':    'Sample Registry',
  '/workflow':   'Workflow Overview',
  '/statistics': 'Statistics',
  '/settings':   'Settings',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'BioSampleTrack'

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {/* Notification placeholder */}
        <button className="btn btn-ghost btn-icon navbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="navbar-badge" />
        </button>

        {/* User avatar placeholder */}
        <div className="navbar-user">
          <UserCircle size={32} color="var(--color-text-muted)" />
          <div className="navbar-user-info">
            <span className="navbar-user-name">Lab Analyst</span>
            <span className="navbar-user-role">Genomics Team</span>
          </div>
        </div>
      </div>
    </header>
  )
}
