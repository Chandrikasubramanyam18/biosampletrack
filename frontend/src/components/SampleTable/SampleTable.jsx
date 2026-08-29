import { Eye, Pencil, Trash2, FlaskConical } from 'lucide-react'
import StatusBadge from '../StatusBadge/StatusBadge'
import './SampleTable.css'

/**
 * SampleTable — renders the paginated list of samples.
 * Props:
 *   samples     Sample[]
 *   loading     boolean
 *   error       string | null
 *   onView      (sample) => void
 *   onEdit      (sample) => void
 *   onDelete    (sample) => void
 *   page        number (0-indexed)
 *   limit       number
 *   onPageChange(newPage) => void
 */
export default function SampleTable({
  samples,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  page,
  limit,
  onPageChange,
}) {
  // --- Loading state ---
  if (loading) {
    return (
      <div className="card table-card">
        <div className="state-container">
          <div className="spinner" />
          <span className="state-desc">Loading samples…</span>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="card table-card">
        <div className="state-container">
          <FlaskConical size={40} className="state-icon" />
          <span className="state-title">Failed to load samples</span>
          <span className="state-desc">{error}</span>
        </div>
      </div>
    )
  }

  // --- Empty state ---
  if (samples.length === 0) {
    return (
      <div className="card table-card">
        <div className="state-container">
          <FlaskConical size={40} className="state-icon" />
          <span className="state-title">No samples found</span>
          <span className="state-desc">
            Try adjusting your search or filters, or add a new sample to get started.
          </span>
        </div>
      </div>
    )
  }

  const hasPrev = page > 0
  const hasNext = samples.length === limit

  return (
    <div className="card table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Type</th>
              <th>Organism</th>
              <th>Tissue</th>
              <th>Condition</th>
              <th>Experiment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id}>
                <td className="td-mono">{s.sample_id}</td>
                <td>{s.sample_type}</td>
                <td className="td-italic">{s.organism}</td>
                <td>{s.tissue}</td>
                <td>{s.condition}</td>
                <td>{s.experiment}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-ghost btn-icon action-btn action-view"
                      title="View details"
                      onClick={() => onView(s)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon action-btn action-edit"
                      title="Edit status"
                      onClick={() => onEdit(s)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon action-btn action-delete"
                      title="Delete sample"
                      onClick={() => onDelete(s)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-pagination">
        <span className="pagination-info">
          Page {page + 1} · Showing {samples.length} sample{samples.length !== 1 ? 's' : ''}
        </span>
        <div className="pagination-controls">
          <button
            className="btn btn-secondary"
            disabled={!hasPrev}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
