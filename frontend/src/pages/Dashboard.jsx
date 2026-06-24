import React, { useEffect, useMemo, useState } from 'react'
import * as api from '../api'

const STATUS_LABELS = {
  available: 'Available',
  claimed: 'Claimed',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  delivered: 'Delivered',
}

export default function Dashboard({ token, user, onLogout }) {
  const [donations, setDonations] = useState([])
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    pickup_address: '',
    delivery_address: '',
    pickup_time: '',
    latitude: '18.5204',
    longitude: '73.8567',
  })
  const [eventForm, setEventForm] = useState({ title: '', description: '', location: '', event_date: '', meals_served: '' })
  const [message, setMessage] = useState('')

  async function load() {
    const [donationRes, eventRes] = await Promise.all([api.fetchDonations(token), api.fetchEvents(token)])
    setDonations(Array.isArray(donationRes) ? donationRes : [])
    setEvents(Array.isArray(eventRes) ? eventRes : [])
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 10000)
    return () => window.clearInterval(timer)
  }, [])

  async function createDonation(e) {
    e.preventDefault()
    const res = await api.createDonation({
      ...form,
      latitude: Number(form.latitude) || null,
      longitude: Number(form.longitude) || null,
    }, token)
    if (res.error) return setMessage(res.error)
    setForm({ title: '', description: '', pickup_address: '', delivery_address: '', pickup_time: '', latitude: '18.5204', longitude: '73.8567' })
    setMessage('Donation posted for pickup.')
    load()
  }

  async function createEvent(e) {
    e.preventDefault()
    const res = await api.createEvent(eventForm, token)
    if (res.error) return setMessage(res.error)
    setEventForm({ title: '', description: '', location: '', event_date: '', meals_served: '' })
    setMessage('NGO event post published.')
    load()
  }

  async function runAction(action) {
    const res = await action()
    if (res && res.error) setMessage(res.error)
    else setMessage('Updated.')
    load()
  }

  return (
    <div className="min-h-screen bg-white text-[#202020]">
      <Header user={user} onLogout={onLogout} />
      <main>
        <Hero />

        <section id="live-map" className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:px-10">
          <LiveMap donations={donations} />
          <WorkflowSummary donations={donations} events={events} />
        </section>

        <section id="donate" className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="space-y-8">
            <DonationForm user={user} form={form} setForm={setForm} createDonation={createDonation} load={load} />
            {user.role === 'ngo' && <NgoEventForm eventForm={eventForm} setEventForm={setEventForm} createEvent={createEvent} />}
            {message && <p className="border border-[#d8eadf] bg-[#f7fbf8] p-4 text-sm font-bold text-[#4a9d64]">{message}</p>}
          </div>
          <div className="space-y-8">
            <DonationFeed donations={donations} user={user} runAction={runAction} token={token} />
            <EventFeed events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-[#62bd80] text-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#about"><LogoMark /></a>
        <nav className="hidden items-center gap-9 text-sm font-bold md:flex">
          <a href="#about">About</a>
          <a href="#live-map">Live Map</a>
          <a href="#donate">Portal</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-black uppercase tracking-[0.18em] sm:inline">{user.role}</span>
          <SearchIcon />
          <button type="button" onClick={onLogout} className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-black transition hover:bg-white hover:text-[#62bd80]">OUT</button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <>
      <section id="about" className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-10">
        <div className="relative min-h-[390px] overflow-hidden">
          <Shape className="-left-24 top-8 h-[330px] w-[330px] bg-[#fac06f]" />
          <PickupArt />
        </div>
        <div className="flex flex-col justify-center pb-4">
          <h1 className="text-[42px] font-black leading-none tracking-normal text-[#ff9413] sm:text-[56px]">Excess Food?</h1>
          <p className="mt-3 text-[34px] font-black leading-none text-[#8f8f8f] sm:text-[44px]">We will <span className="text-[#62bd80]">Pick up!</span></p>
          <p className="mt-6 max-w-[270px] text-base font-bold leading-6 text-[#9a9a9a]">Donors post surplus food, NGOs claim it, volunteers pick up and mark delivery.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
        <div className="relative min-h-[360px] overflow-hidden border-y border-[#dcecdf] py-8">
          <Shape className="-left-24 top-3 h-[330px] w-[330px] bg-[#fac06f]" />
          <Shape className="right-[-92px] top-0 h-[300px] w-[370px] bg-[#a8dfb9]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <FoodDriveArt />
            <div>
              <h2 className="text-[36px] font-black leading-none text-[#62bd80] sm:text-[48px]">Upcoming Food Drive</h2>
              <p className="mt-5 max-w-md text-2xl font-black leading-tight text-[#9a9a9a]">Recover & redistribute surplus food for those in need.</p>
              <a href="#live-map" className="mt-8 inline-flex rounded-lg bg-[#62bd80] px-10 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(98,189,128,0.26)] transition hover:bg-[#4fa96d]">View Map</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function LiveMap({ donations }) {
  const mapped = useMemo(() => donations.map((d, index) => {
    const lat = Number(d.latitude) || 18.52 + (index % 4) * 0.018
    const lng = Number(d.longitude) || 73.85 + (index % 5) * 0.018
    return { ...d, x: 12 + ((lng * 1000) % 74), y: 14 + ((lat * 1000) % 64) }
  }), [donations])

  return (
    <section className="border border-[#d8eadf] bg-[#f7fbf8] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">Real-time Map</p>
          <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Pickup & Delivery</h2>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#62bd80]">Auto refresh 10s</span>
      </div>
      <div className="relative mt-6 h-[360px] overflow-hidden border border-[#d8eadf] bg-white">
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'linear-gradient(#d8eadf 1px, transparent 1px), linear-gradient(90deg, #d8eadf 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
        <div className="absolute left-[8%] top-[18%] h-[64%] w-[76%] rounded-[48%] border-[10px] border-[#a8dfb9]/70" />
        <div className="absolute left-[18%] top-[56%] h-4 w-[62%] rounded-full bg-[#fac06f]/80" />
        {mapped.map((d) => (
          <div key={d.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <div className={`grid h-10 w-10 place-items-center rounded-full border-4 border-white text-xs font-black text-white shadow-lg ${markerColor(d.status)}`}>{d.id}</div>
            <div className="mt-1 whitespace-nowrap bg-white px-2 py-1 text-[11px] font-bold text-[#505050] shadow">{STATUS_LABELS[d.status] || 'Available'}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function WorkflowSummary({ donations, events }) {
  const count = (status) => donations.filter((d) => (d.status || 'available') === status).length
  return (
    <section className="border border-[#d8eadf] bg-white p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">Workflow</p>
      <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Current Movement</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Available" value={count('available')} />
        <Metric label="Claimed" value={count('claimed')} />
        <Metric label="Assigned" value={count('assigned')} />
        <Metric label="Delivered" value={count('delivered')} />
      </div>
      <p className="mt-6 text-sm font-bold leading-6 text-[#747474]">NGO impact posts published: {events.length}</p>
    </section>
  )
}

function DonationForm({ user, form, setForm, createDonation, load }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <section className="border border-[#d8eadf] bg-[#f7fbf8] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">Donor Portal</p>
          <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Post Pickup</h2>
        </div>
        <button type="button" onClick={load} className="rounded-full bg-[#ff9413] px-5 py-2 text-sm font-bold text-white">Refresh</button>
      </div>
      {user.role !== 'donor' ? (
        <p className="mt-6 bg-white p-5 text-sm font-semibold leading-6 text-[#6f6f6f]">Only donor accounts can create pickup requests. NGOs claim requests and volunteers deliver them.</p>
      ) : (
        <form onSubmit={createDonation} className="mt-6 grid gap-4">
          <Field label="Food title"><input value={form.title} onChange={(e) => update('title', e.target.value)} required className="field-input" placeholder="Fresh sandwich trays" /></Field>
          <Field label="Details"><textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="field-input resize-none" placeholder="Quantity, expiry time, packing notes." /></Field>
          <Field label="Pickup address"><input value={form.pickup_address} onChange={(e) => update('pickup_address', e.target.value)} className="field-input" placeholder="Restaurant, hostel, hall..." /></Field>
          <Field label="Delivery address"><input value={form.delivery_address} onChange={(e) => update('delivery_address', e.target.value)} className="field-input" placeholder="NGO kitchen, shelter, event site..." /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Pickup time"><input type="datetime-local" value={form.pickup_time} onChange={(e) => update('pickup_time', e.target.value)} className="field-input" /></Field>
            <Field label="Latitude"><input value={form.latitude} onChange={(e) => update('latitude', e.target.value)} className="field-input" /></Field>
            <Field label="Longitude"><input value={form.longitude} onChange={(e) => update('longitude', e.target.value)} className="field-input" /></Field>
          </div>
          <button type="submit" className="rounded-full bg-[#ff9413] px-9 py-3 text-base font-bold text-white">Publish Pickup</button>
        </form>
      )}
    </section>
  )
}

function NgoEventForm({ eventForm, setEventForm, createEvent }) {
  const update = (key, value) => setEventForm((current) => ({ ...current, [key]: value }))
  return (
    <section className="border border-[#d8eadf] bg-white p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">NGO Portal</p>
      <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Post Event Impact</h2>
      <form onSubmit={createEvent} className="mt-6 grid gap-4">
        <Field label="Event title"><input value={eventForm.title} onChange={(e) => update('title', e.target.value)} required className="field-input" placeholder="Weekend food drive completed" /></Field>
        <Field label="What happened"><textarea rows={4} value={eventForm.description} onChange={(e) => update('description', e.target.value)} className="field-input resize-none" placeholder="Tell donors how the rescued food was used." /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Location"><input value={eventForm.location} onChange={(e) => update('location', e.target.value)} className="field-input" /></Field>
          <Field label="Date"><input type="date" value={eventForm.event_date} onChange={(e) => update('event_date', e.target.value)} className="field-input" /></Field>
          <Field label="Meals served"><input type="number" value={eventForm.meals_served} onChange={(e) => update('meals_served', e.target.value)} className="field-input" /></Field>
        </div>
        <button type="submit" className="rounded-full bg-[#62bd80] px-9 py-3 text-base font-bold text-white">Publish Event</button>
      </form>
    </section>
  )
}

function DonationFeed({ donations, user, runAction, token }) {
  return (
    <section className="border border-[#d8eadf] bg-white p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">Pickup Feed</p>
      <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Requests</h2>
      <div className="mt-6 space-y-4">
        {donations.length ? donations.map((d) => (
          <article key={d.id} className="border border-[#d8eadf] bg-[#f7fbf8] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-[#202020]">{d.title || 'Untitled donation'}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#747474]">{d.description || 'Pickup details not available.'}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8b8b8b]">Pickup: {d.pickup_address || 'Not set'}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8b8b8b]">Delivery: {d.delivery_address || 'Not set'}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#fff1dc] px-4 py-2 text-sm font-black text-[#ff9413]">{STATUS_LABELS[d.status] || 'Available'}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {user.role === 'ngo' && (d.status || 'available') === 'available' && <button onClick={() => runAction(() => api.claimDonation(d.id, token))} className="rounded-full bg-[#62bd80] px-5 py-2 text-sm font-bold text-white">Claim for NGO</button>}
              {user.role === 'volunteer' && !['assigned', 'picked_up', 'delivered'].includes(d.status) && <button onClick={() => runAction(() => api.assignDonation(d.id, token))} className="rounded-full bg-[#62bd80] px-5 py-2 text-sm font-bold text-white">Assign Pickup</button>}
              {user.role === 'volunteer' && d.status === 'assigned' && <button onClick={() => runAction(() => api.updateDonationStatus(d.id, 'picked_up', token))} className="rounded-full bg-[#ff9413] px-5 py-2 text-sm font-bold text-white">Mark Picked Up</button>}
              {user.role === 'volunteer' && d.status === 'picked_up' && <button onClick={() => runAction(() => api.updateDonationStatus(d.id, 'delivered', token))} className="rounded-full bg-[#087333] px-5 py-2 text-sm font-bold text-white">Mark Delivered</button>}
              {user.role === 'donor' && d.donor_id === user.id && <span className="rounded-full bg-[#62bd80]/15 px-5 py-2 text-sm font-bold text-[#4a9d64]">Your pickup</span>}
            </div>
          </article>
        )) : (
          <div className="border border-dashed border-[#b9dcc6] bg-[#f7fbf8] p-8 text-center text-sm font-bold text-[#747474]">No pickup requests yet.</div>
        )}
      </div>
    </section>
  )
}

function EventFeed({ events }) {
  return (
    <section className="border border-[#d8eadf] bg-[#f7fbf8] p-6 sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#62bd80]">NGO Updates</p>
      <h2 className="mt-3 text-3xl font-black text-[#ff9413]">Food Impact Posts</h2>
      <div className="mt-6 space-y-4">
        {events.length ? events.map((event) => (
          <article key={event.id} className="border border-[#d8eadf] bg-white p-5">
            <h3 className="text-xl font-black">{event.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#747474]">{event.description || 'No description added.'}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8b8b8b]">{event.location || 'Location not set'} - {event.event_date || 'Date not set'} - {event.meals_served || 0} meals</p>
          </article>
        )) : <div className="border border-dashed border-[#b9dcc6] bg-white p-8 text-center text-sm font-bold text-[#747474]">No NGO event posts yet.</div>}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#087333] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-8 text-xs font-bold">
          <span className="text-lg font-black">Food Rescue</span>
          <a href="#live-map">Live Map</a>
          <a href="#donate">Portal</a>
        </div>
        <span className="text-xs font-bold">Pickup, delivery, and NGO impact tracking</span>
      </div>
    </footer>
  )
}

function Metric({ label, value }) {
  return (
    <div className="border border-[#d8eadf] bg-[#f7fbf8] p-5">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#62bd80]">{label}</p>
      <p className="mt-2 text-4xl font-black text-[#ff9413]">{value}</p>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block text-sm font-black text-[#727272]">{label}{children}</label>
}

function Shape({ className }) {
  return <div aria-hidden="true" className={`absolute rounded-[48%] opacity-95 ${className}`} />
}

function markerColor(status) {
  if (status === 'delivered') return 'bg-[#087333]'
  if (status === 'picked_up') return 'bg-[#ff9413]'
  if (status === 'assigned') return 'bg-[#62bd80]'
  if (status === 'claimed') return 'bg-[#fac06f]'
  return 'bg-[#8f8f8f]'
}

function LogoMark() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-black leading-none">FR</span>
      <span className="text-[11px] font-black uppercase leading-[0.9]">Food<br />Rescue</span>
    </span>
  )
}

function SearchIcon() {
  return (
    <span aria-hidden="true" className="relative block h-7 w-7">
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full border-[3px] border-white" />
      <span className="absolute bottom-1 right-1 h-3 w-[3px] rotate-[-45deg] bg-white" />
    </span>
  )
}

function PickupArt() {
  return (
    <svg viewBox="0 0 540 420" className="relative z-10 mx-auto h-auto w-full max-w-[540px]" role="img" aria-label="Volunteer offering food pickup">
      <path d="M184 154c0-61 48-110 109-110 62 0 111 49 111 110" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
      <path d="M225 73c36 25 84 30 143 15" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
      <circle cx="267" cy="149" r="6" fill="#111" /><circle cx="333" cy="149" r="6" fill="#111" />
      <path d="M267 184c21 15 52 15 75 0M172 405c12-72 35-127 69-164 31-34 70-52 116-52 55 0 101 26 139 78" fill="none" stroke="#111" strokeWidth="10" strokeLinecap="round" />
      <path d="M394 245c29 22 58 50 87 84 13 15 9 34-8 44-13 8-30 4-49-13l-62-58" fill="none" stroke="#111" strokeWidth="10" strokeLinecap="round" />
      <path d="M108 242h144v102H108zM252 242l82-40v102l-82 40zM108 242l82-40h144l-82 40z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M473 329c23 0 44-9 63-28M103 217c27-28 61-42 103-42" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

function FoodDriveArt() {
  return (
    <svg viewBox="0 0 560 310" className="h-auto w-full max-w-[560px]" role="img" aria-label="Food drive truck collecting donation boxes">
      <path d="M74 150h260v90H74zM334 178h80l52 62H334z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M114 240a32 32 0 1 0 64 0M366 240a32 32 0 1 0 64 0" fill="none" stroke="#111" strokeWidth="8" />
      <path d="M106 105h82v72h-82zM211 94h84v83h-84z" fill="#fff" stroke="#111" strokeWidth="8" />
      <path d="M123 140h49M229 130h48M96 150c34-42 79-63 135-63 51 0 94 19 128 56" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M444 78h60v60h-60z" fill="#fff" stroke="#111" strokeWidth="7" />
      <path d="M444 99h60M461 66v24M488 66v24M475 119h1" stroke="#111" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
