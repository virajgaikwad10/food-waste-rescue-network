import React, { useEffect, useState } from 'react'
import * as api from '../api'

export default function Donations({ token, user, onLogout }) {
  const [donations, setDonations] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function load() {
    const res = await api.fetchDonations(token)
    setDonations(Array.isArray(res) ? res : [])
  }

  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    await api.createDonation({ title, description }, token)
    setTitle('')
    setDescription('')
    load()
  }

  async function claim(id) {
    await api.claimDonation(id, token)
    load()
  }

  async function assign(id) {
    await api.assignDonation(id, token)
    load()
  }

  const badgeFor = (s) => {
    if (!s) return 'Available'
    if (s === 'available') return 'Available'
    if (s === 'claimed') return 'Claimed'
    if (s === 'assigned') return 'Assigned'
    return 'Available'
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="rounded-[2.5rem] border border-emerald-200 bg-white p-6 shadow-[0_30px_60px_rgba(16,185,129,0.12)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Food Waste Rescue Network</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Create donation listings with ease.</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">{user.role.toUpperCase()}</span>
              <button onClick={onLogout} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Logout</button>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Donors, NGOs, and volunteers can manage food pickup, claim requests, and donation impact from a single branded dashboard.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 rounded-[2.5rem] bg-white p-8 shadow-[0_30px_60px_rgba(16,185,129,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-emerald-700">Donation creation</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">New donation listing</h2>
              </div>
              <button onClick={load} className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">Refresh listings</button>
            </div>

            {user.role !== 'donor' ? (
              <div className="rounded-[2rem] bg-emerald-50 p-6 text-slate-700">
                Only donors may publish donations. NGO and volunteer users can claim and track listings below.
              </div>
            ) : (
              <form onSubmit={create} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-2 w-full rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300" placeholder="e.g. Fresh sandwich tray" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-300" placeholder="Add pickup instructions, food type, and location details." />
                </div>
                <button type="submit" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Publish donation</button>
              </form>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoPanel title="Trusted volunteers" subtitle="Local teams ready for same-day pickup." />
              <InfoPanel title="Impact visibility" subtitle="Track donations from donor to delivery." />
            </div>
          </section>

          <section className="space-y-6 rounded-[2.5rem] bg-emerald-900 p-8 text-white shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200">Donation feed</p>
              <h2 className="text-2xl font-semibold">Available donations</h2>
            </div>
            <div className="space-y-4">
              {donations.length ? donations.map((d) => (
                <div key={d.id} className="rounded-[2rem] border border-emerald-200/20 bg-emerald-950/80 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-white">{d.title || 'Untitled donation'}</p>
                      <p className="text-sm leading-6 text-emerald-200">{d.description || 'Pickup details not available.'}</p>
                    </div>
                    <span className="rounded-full bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-100">{badgeFor(d.status)}</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-emerald-200">Donor ID: {d.donor_id || '-'} - Listing ID: {d.id}</div>
                    <div className="flex flex-wrap gap-2">
                      {user.role === 'ngo' && d.status === 'available' && <button onClick={() => claim(d.id)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Claim</button>}
                      {user.role === 'volunteer' && d.status !== 'assigned' && <button onClick={() => assign(d.id)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Assign to me</button>}
                      {user.role === 'donor' && d.donor_id === user.id && <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100">Your listing</span>}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-[2rem] border border-emerald-200/20 bg-emerald-950/80 p-6 text-center text-emerald-200">No donations available yet. Use the form to publish a new listing or refresh the feed.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoPanel({ title, subtitle }) {
  return (
    <div className="rounded-[2rem] border border-emerald-100/80 bg-white/90 p-5 text-slate-900 shadow-[0_18px_36px_rgba(16,185,129,0.08)]">
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-700">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  )
}
