import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import './SearchBar.css'

/**
 * SearchBar with debounced input.
 * Props:
 *   value       string   controlled value
 *   onChange    (val) => void
 *   placeholder string
 */
export default function SearchBar({ value, onChange, placeholder = 'Search samples…' }) {
  const inputRef = useRef(null)

  // Auto-clear button
  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="search-bar">
      <Search size={15} className="search-icon" />
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear" onClick={handleClear} title="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
