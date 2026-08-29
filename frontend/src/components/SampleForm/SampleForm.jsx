import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'
import { createSample } from '../../services/api'
import { useToast } from '../Toast/Toast'
import './SampleForm.css'

const STATUSES = ['Received', 'QC', 'Library Prep', 'Sequencing', 'Analysis', 'Completed', 'Failed']

const INITIAL = {
  sample_id: '',
  sample_type: '',
  organism: '',
  tissue: '',
  condition: '',
  experiment: '',
  status: 'Received',
}

function validate(form) {
  const errors = {}
  if (!form.sample_id.trim())   errors.sample_id   = 'Sample ID is required (min 3 chars).'
  if (form.sample_id.trim().length < 3) errors.sample_id = 'Sample ID must be at least 3 characters.'
  if (!form.sample_type.trim()) errors.sample_type = 'Sample type is required.'
  if (!form.organism.trim())    errors.organism    = 'Organism is required.'
  if (!form.tissue.trim())      errors.tissue      = 'Tissue is required.'
  if (!form.condition.trim())   errors.condition   = 'Condition is required.'
  if (!form.experiment.trim())  errors.experiment  = 'Experiment is required.'
  return errors
}

/**
 * SampleForm — "Add Sample" modal.
 * Props:
 *   isOpen    boolean
 *   onClose   () => void
 *   onSuccess () => void  (called after successful creation)
 */
export default function SampleForm({ isOpen, onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  if (!isOpen) return null

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    setServerError(null)
    try {
      await createSample(form)
      toast({ message: `Sample "${form.sample_id}" created successfully.`, type: 'success' })
      setForm(INITIAL)
      setErrors({})
      onSuccess()
      onClose()
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setForm(INITIAL)
    setErrors({})
    setServerError(null)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <FlaskConical size={18} />
            Add New Sample
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body sample-form-grid">
            {/* Sample ID */}
            <div className="form-group">
              <label className="form-label">Sample ID *</label>
              <input
                className={`form-input${errors.sample_id ? ' error' : ''}`}
                placeholder="e.g. BS-010"
                value={form.sample_id}
                onChange={handleChange('sample_id')}
              />
              {errors.sample_id && <span className="form-error">{errors.sample_id}</span>}
            </div>

            {/* Sample Type */}
            <div className="form-group">
              <label className="form-label">Sample Type *</label>
              <input
                className={`form-input${errors.sample_type ? ' error' : ''}`}
                placeholder="e.g. RNA, DNA, Protein"
                value={form.sample_type}
                onChange={handleChange('sample_type')}
              />
              {errors.sample_type && <span className="form-error">{errors.sample_type}</span>}
            </div>

            {/* Organism */}
            <div className="form-group">
              <label className="form-label">Organism *</label>
              <input
                className={`form-input${errors.organism ? ' error' : ''}`}
                placeholder="e.g. Homo sapiens"
                value={form.organism}
                onChange={handleChange('organism')}
              />
              {errors.organism && <span className="form-error">{errors.organism}</span>}
            </div>

            {/* Tissue */}
            <div className="form-group">
              <label className="form-label">Tissue *</label>
              <input
                className={`form-input${errors.tissue ? ' error' : ''}`}
                placeholder="e.g. Brain cortex"
                value={form.tissue}
                onChange={handleChange('tissue')}
              />
              {errors.tissue && <span className="form-error">{errors.tissue}</span>}
            </div>

            {/* Condition */}
            <div className="form-group">
              <label className="form-label">Condition *</label>
              <input
                className={`form-input${errors.condition ? ' error' : ''}`}
                placeholder="e.g. Tumour, Control"
                value={form.condition}
                onChange={handleChange('condition')}
              />
              {errors.condition && <span className="form-error">{errors.condition}</span>}
            </div>

            {/* Experiment */}
            <div className="form-group">
              <label className="form-label">Experiment *</label>
              <input
                className={`form-input${errors.experiment ? ' error' : ''}`}
                placeholder="e.g. RNA-seq batch 4"
                value={form.experiment}
                onChange={handleChange('experiment')}
              />
              {errors.experiment && <span className="form-error">{errors.experiment}</span>}
            </div>

            {/* Status */}
            <div className="form-group form-group-full">
              <label className="form-label">Initial Status *</label>
              <select
                className="form-select"
                value={form.status}
                onChange={handleChange('status')}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="form-group form-group-full">
                <p className="form-server-error">{serverError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Sample'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
