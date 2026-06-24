const API_HOST = window.location.hostname || 'localhost'
const API_BASE = `http://${API_HOST}:4000/api`

async function post(path, body, token) {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return res.ok ? data : { error: data.error || 'Request failed' }
  } catch (err) {
    return { error: 'Backend is not running. Start the API server on port 4000.' }
  }
}

async function get(path, token) {
  try {
    const res = await fetch(API_BASE + path, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
    const data = await res.json().catch(() => ({}))
    return res.ok ? data : { error: data.error || 'Request failed' }
  } catch (err) {
    return { error: 'Backend is not running. Start the API server on port 4000.' }
  }
}

export async function login(email, password) {
  return post('/auth/login', { email, password })
}

export async function register(name, email, password, role) {
  return post('/auth/register', { name, email, password, role })
}

export async function fetchDonations(token) {
  return get('/donations', token)
}

export async function createDonation(data, token) {
  return post('/donations', data, token)
}

export async function claimDonation(id, token) {
  return post(`/donations/${id}/claim`, {}, token)
}

export async function assignDonation(id, token) {
  return post(`/donations/${id}/assign`, {}, token)
}

export async function updateDonationStatus(id, status, token) {
  return post(`/donations/${id}/status`, { status }, token)
}

export async function fetchEvents(token) {
  return get('/events', token)
}

export async function createEvent(data, token) {
  return post('/events', data, token)
}

export default { login, register, fetchDonations, createDonation, claimDonation, assignDonation, updateDonationStatus, fetchEvents, createEvent }
