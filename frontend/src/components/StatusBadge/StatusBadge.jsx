import './StatusBadge.css'

const STATUS_CONFIG = {
  'Received':    { cls: 'badge--received',   label: 'Received' },
  'QC':          { cls: 'badge--qc',         label: 'QC' },
  'Library Prep':{ cls: 'badge--library',    label: 'Library Prep' },
  'Sequencing':  { cls: 'badge--sequencing', label: 'Sequencing' },
  'Analysis':    { cls: 'badge--analysis',   label: 'Analysis' },
  'Completed':   { cls: 'badge--completed',  label: 'Completed' },
  'Failed':      { cls: 'badge--failed',     label: 'Failed' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { cls: 'badge--default', label: status }
  return (
    <span className={`status-badge ${config.cls}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  )
}
