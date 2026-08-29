/**
 * api.js — Central API service layer.
 *
 * All requests go through this module. The base URL is read
 * from the VITE_API_URL environment variable so it never
 * needs to be changed anywhere else in the codebase.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ------------------------------------------------------------------
// Internal fetch wrapper — handles JSON parsing and error extraction
// ------------------------------------------------------------------

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Try to extract a friendly detail message from FastAPI error responses
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        detail = Array.isArray(errorBody.detail)
          ? errorBody.detail.map((e) => e.msg).join(', ')
          : errorBody.detail;
      }
    } catch {
      // non-JSON error body — keep the generic message
    }
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }

  // DELETE returns a JSON body with a message; handle empty responses too
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

// ------------------------------------------------------------------
// Sample endpoints
// ------------------------------------------------------------------

/** GET /samples/statistics */
export async function fetchStatistics() {
  return apiFetch('/samples/statistics');
}

/**
 * GET /samples
 * Supports: status filter, free-text search, pagination (skip/limit)
 */
export async function fetchSamples({ status, search, skip = 0, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  return apiFetch(`/samples?${params.toString()}`);
}

/** GET /samples/{sample_id} */
export async function fetchSample(sampleId) {
  return apiFetch(`/samples/${encodeURIComponent(sampleId)}`);
}

/** POST /samples */
export async function createSample(data) {
  return apiFetch('/samples', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /samples/{sample_id} */
export async function updateSampleStatus(sampleId, status) {
  return apiFetch(`/samples/${encodeURIComponent(sampleId)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/** DELETE /samples/{sample_id} */
export async function deleteSample(sampleId) {
  return apiFetch(`/samples/${encodeURIComponent(sampleId)}`, {
    method: 'DELETE',
  });
}
