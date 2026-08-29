import { useNavigate } from 'react-router-dom'
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
  GitBranch,
  ClipboardList,
  Database,
  ArrowRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import StatCard from '../components/StatCard/StatCard'
import { useStatistics } from '../hooks/useStatistics'
import './Dashboard.css'

const STATUS_META = [
  { key: 'Received',    label: 'Received',     icon: ClipboardList, color: '#3b82f6' },
  { key: 'QC',          label: 'QC',            icon: Activity,      color: '#8b5cf6' },
  { key: 'Library Prep',label: 'Library Prep',  icon: Layers,        color: '#f59e0b' },
  { key: 'Sequencing',  label: 'Sequencing',    icon: GitBranch,     color: '#06b6d4' },
  { key: 'Analysis',    label: 'Analysis',      icon: Database,      color: '#10b981' },
  { key: 'Completed',   label: 'Completed',     icon: CheckCircle,   color: '#059669' },
  { key: 'Failed',      label: 'Failed',        icon: XCircle,       color: '#ef4444' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value} sample{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { statistics, loading, error } = useStatistics()
  const navigate = useNavigate()

  const chartData = STATUS_META.map(({ key, label, color }) => ({
    name: label,
    count: statistics?.by_status?.[key] ?? 0,
    color,
  }))

  return (
    <div className="dashboard">
      {/* Error banner */}
      {error && (
        <div className="dashboard-error">
          <XCircle size={16} />
          <span>Failed to load statistics: {error}</span>
        </div>
      )}

      {/* Total samples */}
      <div className="dashboard-total">
        <div className="total-card">
          <div className="total-icon">
            <FlaskConical size={28} />
          </div>
          <div>
            <div className="total-label">Total Samples</div>
            <div className="total-value">
              {loading ? <span className="stat-card-skeleton" /> : statistics?.total ?? '—'}
            </div>
          </div>
          <button
            className="btn btn-secondary total-action"
            onClick={() => navigate('/samples')}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Status cards grid */}
      <div className="stats-grid">
        {STATUS_META.map(({ key, label, icon, color }) => (
          <StatCard
            key={key}
            label={label}
            value={statistics?.by_status?.[key]}
            icon={icon}
            color={color}
            loading={loading}
          />
        ))}
      </div>

      {/* Workflow distribution chart */}
      <div className="card chart-card">
        <div className="section-header">
          <h2 className="section-title">
            <GitBranch size={17} />
            Workflow Distribution
          </h2>
        </div>

        {loading ? (
          <div className="state-container" style={{ padding: '2rem 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
