import { useState, useCallback } from 'react'
import { Plus, Filter } from 'lucide-react'
import SearchBar from '../components/SearchBar/SearchBar'
import SampleTable from '../components/SampleTable/SampleTable'
import SampleForm from '../components/SampleForm/SampleForm'
import SampleDetails from '../components/SampleDetails/SampleDetails'
import EditStatusModal from '../components/EditStatusModal/EditStatusModal'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { useToast } from '../components/Toast/Toast'
import { useSamples } from '../hooks/useSamples'
import { deleteSample } from '../services/api'
import './Samples.css'

const STATUSES = ['All', 'Received', 'QC', 'Library Prep', 'Sequencing', 'Analysis', 'Completed', 'Failed']
const LIMIT = 20

export default function Samples() {
  const toast = useToast()

  // Filters & pagination state
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]               = useState(0)
  // Debounced search value (we update it 400ms after typing stops)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState(null)

  // Modal state
  const [showAdd, setShowAdd]               = useState(false)
  const [viewSampleId, setViewSampleId]     = useState(null)
  const [editSample, setEditSample]         = useState(null)
  const [deletePending, setDeletePending]   = useState(null)
  const [deleting, setDeleting]             = useState(false)

  // Data
  const { samples, loading, error, reload } = useSamples({
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: LIMIT,
  })

  // Debounce search so we don't fire on every keystroke
  const handleSearchChange = useCallback((val) => {
    setSearch(val)
    clearTimeout(searchTimer)
    const t = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(0)
    }, 400)
    setSearchTimer(t)
  }, [searchTimer])

  const handleStatusChange = (e) => {
    const val = e.target.value
    setStatusFilter(val === 'All' ? '' : val)
    setPage(0)
  }

  // After any mutation, reload both samples and stats
  const handleMutationSuccess = () => {
    reload()
  }

  // Delete flow
  const handleDeleteConfirm = async () => {
    if (!deletePending) return
    setDeleting(true)
    try {
      await deleteSample(deletePending.sample_id)
      toast({ message: `Sample "${deletePending.sample_id}" deleted.`, type: 'success' })
      setDeletePending(null)
      reload()
    } catch (err) {
      toast({ message: err.message, type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="samples-page">
      {/* Toolbar */}
      <div className="samples-toolbar">
        <div className="toolbar-filters">
          <SearchBar value={search} onChange={handleSearchChange} />
          <div className="status-filter">
            <Filter size={15} className="filter-icon" />
            <select
              className="form-select filter-select"
              value={statusFilter || 'All'}
              onChange={handleStatusChange}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Add Sample
        </button>
      </div>

      {/* Sample table */}
      <SampleTable
        samples={samples}
        loading={loading}
        error={error}
        onView={(s) => setViewSampleId(s.sample_id)}
        onEdit={(s) => setEditSample(s)}
        onDelete={(s) => setDeletePending(s)}
        page={page}
        limit={LIMIT}
        onPageChange={setPage}
      />

      {/* Modals */}
      <SampleForm
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleMutationSuccess}
      />

      <SampleDetails
        sampleId={viewSampleId}
        onClose={() => setViewSampleId(null)}
      />

      <EditStatusModal
        sample={editSample}
        onClose={() => setEditSample(null)}
        onSuccess={handleMutationSuccess}
      />

      <ConfirmDialog
        isOpen={!!deletePending}
        title={`Delete ${deletePending?.sample_id}?`}
        message={`This will permanently remove sample "${deletePending?.sample_id}" from the database. This action cannot be undone.`}
        confirmLabel="Delete Sample"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePending(null)}
        loading={deleting}
      />
    </div>
  )
}
