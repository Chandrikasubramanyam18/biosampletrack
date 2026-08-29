import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { useStatistics } from '../hooks/useStatistics'
import { GitBranch } from 'lucide-react'
import './Workflow.css'

const STATUS_META = [
  { key: 'Received',    label: 'Received',     color: '#3b82f6', order: 1 },
  { key: 'QC',          label: 'QC',           color: '#8b5cf6', order: 2 },
  { key: 'Library Prep',label: 'Library Prep', color: '#f59e0b', order: 3 },
  { key: 'Sequencing',  label: 'Sequencing',   color: '#06b6d4', order: 4 },
  { key: 'Analysis',    label: 'Analysis',     color: '#10b981', order: 5 },
  { key: 'Completed',   label: 'Completed',    color: '#059669', order: 6 },
  { key: 'Failed',      label: 'Failed',       color: '#ef4444', order: 7 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '2px' }}>{label || payload[0]?.name}</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
          {payload[0].value} sample{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  return null
}

export default function Workflow() {
  const { statistics, loading, error } = useStatistics()

  const chartData = STATUS_META.map(({ key, label, color }) => ({
    name: label,
    count: statistics?.by_status?.[key] ?? 0,
    color,
  }))

  const pieData = chartData.filter((d) => d.count > 0)

  return (
    <div className="workflow-page">
      {error && (
        <div className="dashboard-error" style={{ marginBottom: '1rem' }}>
          Failed to load statistics: {error}
        </div>
      )}

      {/* Pipeline flow */}
      <div className="card">
        <h2 className="section-title mb-4">
          <GitBranch size={17} /> NGS Pipeline Stages
        </h2>
        <div className="pipeline-flow">
          {STATUS_META.filter((s) => s.key !== 'Failed').map(({ key, label, color }, i, arr) => (
            <div key={key} className="pipeline-step">
              <div className="pipeline-node" style={{ borderColor: color, color }}>
                <span className="pipeline-count">
                  {loading ? '…' : (statistics?.by_status?.[key] ?? 0)}
                </span>
                <span className="pipeline-stage">{label}</span>
              </div>
              {i < arr.length - 1 && <div className="pipeline-arrow">→</div>}
            </div>
          ))}
        </div>
        <div className="pipeline-failed">
          <span className="failed-label">Failed:</span>
          <span className="failed-value" style={{ color: '#ef4444' }}>
            {loading ? '…' : (statistics?.by_status?.['Failed'] ?? 0)} sample(s)
          </span>
        </div>
      </div>

      <div className="workflow-charts">
        {/* Bar chart */}
        <div className="card">
          <h2 className="section-title mb-4">Sample Count by Stage</h2>
          {loading ? (
            <div className="state-container" style={{ padding: '2rem 0' }}><div className="spinner" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="section-title mb-4">Status Distribution</h2>
          {loading ? (
            <div className="state-container" style={{ padding: '2rem 0' }}><div className="spinner" /></div>
          ) : pieData.length === 0 ? (
            <div className="state-container" style={{ padding: '2rem 0' }}>
              <span className="state-desc">No samples to display.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
