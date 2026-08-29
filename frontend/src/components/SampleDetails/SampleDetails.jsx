import { useEffect, useState } from 'react'
import { X, FlaskConical } from 'lucide-react'
import { fetchSample } from '../../services/api'
import StatusBadge from '../StatusBadge/StatusBadge'
import './SampleDetails.css'

/**
 * SampleDetails — modal that fetches and displays a single sample.
 * Props:
 *   sampleId  string | null  (null = closed)
 *   onClose   () => void
 */
export default function SampleDetails({ sampleId, onClose }) {
  const [sample, setSample] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sampleId) return
    setSample(null)
    setError(null)
    setLoading(true)
    fetchSample(sampleId)
      .then(setSample)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sampleId])

  if (!sampleId) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FlaskConical size={18} />
            Sample Details
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="state-container" style={{ padding: '2rem 0' }}>
              <div className="spinner" />
              <span className="state-desc">Loading sample…</span>
            </div>
          )}

          {error && (
            <div className="details-error">
              <p>{error}</p>
            </div>
          )}

          {sample && (
            <div className="details-grid">
              <DetailField label="Sample ID"    value={<span className="detail-mono">{sample.sample_id}</span>} />
              <DetailField label="Database ID"  value={`#${sample.id}`} />
              <DetailField label="Sample Type"  value={sample.sample_type} />
              <DetailField label="Organism"     value={<em>{sample.organism}</em>} />
              <DetailField label="Tissue"       value={sample.tissue} />
              <DetailField label="Condition"    value={sample.condition} />
              <DetailField label="Experiment"   value={sample.experiment} />
              <DetailField
                label="Workflow Status"
                value={<StatusBadge status={sample.status} />}
                full
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, value, full }) {
  return (
    <div className={`detail-field${full ? ' detail-field--full' : ''}`}>
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}
