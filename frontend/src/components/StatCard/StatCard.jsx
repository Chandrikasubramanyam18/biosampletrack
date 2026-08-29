import './StatCard.css'

export default function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="stat-card-value">
        {loading ? <span className="stat-card-skeleton" /> : value ?? '—'}
      </div>
    </div>
  )
}
