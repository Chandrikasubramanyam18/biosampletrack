import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FlaskConical,
  GitBranch,
  BarChart2,
  Settings,
  Dna,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/samples',    label: 'Samples',    icon: FlaskConical },
  { to: '/workflow',   label: 'Workflow',   icon: GitBranch },
  { to: '/statistics', label: 'Statistics', icon: BarChart2 },
  { to: '/settings',  label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Dna size={22} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">BioSampleTrack</span>
          <span className="sidebar-brand-tagline">NGS Workflow Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-version">v0.1.0 · FastAPI + React</span>
      </div>
    </aside>
  )
}
