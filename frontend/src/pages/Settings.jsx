import { Dna, Server, ExternalLink } from 'lucide-react'
import './Settings.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function Settings() {
  return (
    <div className="settings-page">
      {/* About */}
      <div className="card">
        <div className="settings-about">
          <div className="settings-logo">
            <Dna size={36} />
          </div>
          <div>
            <h2 className="settings-app-name">BioSampleTrack</h2>
            <p className="settings-tagline">
              Biological Sample and NGS Workflow Tracking System · v0.1.0
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="card">
        <h2 className="section-title mb-4">
          <Server size={17} /> API Configuration
        </h2>
        <div className="config-row">
          <span className="config-label">Backend URL</span>
          <code className="config-value">{API_URL}</code>
        </div>
        <div className="config-row">
          <span className="config-label">Env variable</span>
          <code className="config-value">VITE_API_URL</code>
        </div>
        <p className="settings-note">
          To change the backend URL, update <code>.env</code> in the frontend directory and restart the dev server.
        </p>
      </div>

      {/* Links */}
      <div className="card settings-links">
        <a
          href={`${API_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <ExternalLink size={15} /> FastAPI Swagger Docs
        </a>
        <a
          href={`${API_URL}/redoc`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <ExternalLink size={15} /> ReDoc API Reference
        </a>
      </div>
    </div>
  )
}
