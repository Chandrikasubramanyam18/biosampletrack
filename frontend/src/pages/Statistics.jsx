import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { useStatistics } from '../hooks/useStatistics'
import StatusBadge from '../components/StatusBadge/StatusBadge'
import './Statistics.css'

const STATUS_META = [
  { key: 'Received',    color: '#3b82f6' },
  { key: 'QC',         color: '#8b5cf6' },
  { key: 'Library Prep', color: '#f59e0b' },
  { key: 'Sequencing', color: '#06b6d4' },
  { key: 'Analysis',   color: '#10b981' },
  { key: 'Completed',  color: '#059669' },
  { key: 'Failed',     color: '#ef4444' },
]

export default function Statistics() {
  const { statistics, loading, error } = useStatistics()

  const radarData = STATUS_META.map(({ key }) => ({
    subject: key,
    count: statistics?.by_status?.[key] ?? 0,
  }))

  return (
    <div className="statistics-page">
      {error && (
        <div className="dashboard-error">{error}</div>
      )}

      {/* Summary table */}
      <div className="card">
        <div className="section-header mb-4">
          <h2 className="section-title">Status Summary</h2>
          <span className="text-muted">
            Total: <strong>{loading ? '…' : statistics?.total ?? '—'}</strong>
          </span>
        </div>

        {loading ? (
          <div className="state-container" style={{ padding: '2rem 0' }}><div className="spinner" /></div>
        ) : (
          <div className="stats-table">
            <div className="stats-table-header">
              <span>Status</span>
              <span>Count</span>
              <span>Proportion</span>
            </div>
            {STATUS_META.map(({ key, color }) => {
              const count = statistics?.by_status?.[key] ?? 0
              const total = statistics?.total || 1
              const pct = ((count / total) * 100).toFixed(1)
              return (
                <div key={key} className="stats-table-row">
                  <span><StatusBadge status={key} /></span>
                  <span className="stats-count">{count}</span>
                  <div className="stats-bar-cell">
                    <div className="stats-bar-track">
                      <div
                        className="stats-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="stats-pct">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Radar chart */}
      <div className="card">
        <h2 className="section-title mb-4">Coverage Radar</h2>
        {loading ? (
          <div className="state-container" style={{ padding: '2rem 0' }}><div className="spinner" /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <Radar
                name="Samples"
                dataKey="count"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.18}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
