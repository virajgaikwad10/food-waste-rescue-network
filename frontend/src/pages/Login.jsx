import React, { useState } from 'react'
import * as api from '../api'

export default function Login({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor')
  const [err, setErr] = useState(null)

  async function submit(e) {
    e.preventDefault()
    try {
      const res = isRegister ? await api.register(name, email, password, role) : await api.login(email, password)
      if (res.error) return setErr(res.error)
      onAuth(res.token, res.user)
    } catch (err) {
      setErr('Request failed')
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#202020]">
      <TopBar compact />
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-10">
        <section className="relative grid min-h-[520px] items-center overflow-hidden border-b border-[#dfeee5] py-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
          <Shape className="-left-20 top-28 h-72 w-72 bg-[#9fdcaf]" />
          <Shape className="right-2 top-8 h-60 w-60 bg-[#fac06f]" />
          <div className="relative z-10">
            <p className="max-w-[360px] text-[46px] font-black uppercase leading-[0.98] tracking-normal text-[#ff9413] sm:text-[64px]">
              Food Access
            </p>
            <p className="mt-2 text-2xl font-bold text-[#878787] sm:text-3xl">with</p>
            <p className="inline-block text-[42px] font-black leading-none text-[#62bd80] sm:text-[58px]">Dignity</p>
            <div className="mt-1 h-2 w-40 rounded-full bg-[#ff9413]" />
            <button type="button" className="mt-10 w-full max-w-[300px] rounded-full bg-[#ff9413] px-8 py-3 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(255,148,19,0.24)] transition hover:bg-[#ea8208]">
              Receive Food
            </button>
          </div>
          <div className="relative z-10 mt-10 lg:mt-0">
            <BoxVolunteerArt />
          </div>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative min-h-[260px]">
            <Shape className="-left-16 top-6 h-64 w-64 bg-[#9fdcaf]" />
            <FoodBagArt />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-[#61bd80]">Excess Food?</h2>
            <p className="mt-3 max-w-sm text-lg font-semibold leading-6 text-[#a1a1a1]">You can make a difference.</p>
            <button type="button" className="mt-8 rounded-full bg-[#ff9413] px-12 py-3 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(255,148,19,0.22)] transition hover:bg-[#ea8208]">
              Donate
            </button>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#dfeee5] pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="relative min-h-[280px]">
            <Shape className="-left-20 top-4 h-72 w-72 bg-[#fac06f]" />
            <HandoffArt />
          </div>
          <div id="account" className="border border-[#d8eadf] bg-white p-6 shadow-[0_18px_46px_rgba(59,118,82,0.12)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#63bd80]">{isRegister ? 'Create account' : 'Welcome back'}</p>
            <h2 className="mt-3 text-3xl font-black text-[#ff9413]">{isRegister ? 'Join the network' : 'Sign in'}</h2>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {isRegister && (
                <Field label="Full name">
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="field-input" />
                </Field>
              )}
              <Field label="Email address">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field-input" />
              </Field>
              <Field label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field-input" />
              </Field>
              {isRegister && (
                <Field label="Role">
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="field-input">
                    <option value="donor">Donor</option>
                    <option value="ngo">NGO</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
              )}
              <button type="submit" className="w-full rounded-full bg-[#62bd80] px-6 py-3 text-base font-bold text-white transition hover:bg-[#4ba769]">
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
              {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
            </form>
            <button type="button" className="mt-5 text-sm font-bold text-[#ff9413]" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already have an account? Sign in' : 'New here? Create account'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function TopBar({ compact = false }) {
  return (
    <header className="sticky top-0 z-30 bg-[#62bd80] text-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-[72px] items-center gap-3">
          <MenuIcon />
          <span className="hidden sm:inline-flex"><LogoMark /></span>
        </div>
        <span className="sm:hidden"><LogoMark /></span>
        <nav className="hidden items-center gap-8 text-sm font-bold sm:flex">
          <a href="#about">About</a>
          <a href="#account">Receive</a>
          <a href="#account">Donate</a>
        </nav>
        <div className="flex items-center gap-4">
          <SearchIcon />
          <a href="#account" aria-label="Account" className="grid h-8 w-8 place-items-center rounded-full border-2 border-white">
            <span className="h-3 w-3 rounded-full bg-white" />
          </a>
        </div>
      </div>
    </header>
  )
}

function LogoMark() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-black leading-none">FR</span>
      <span className="text-[11px] font-black uppercase leading-[0.9]">Food<br />Rescue</span>
    </span>
  )
}

function MenuIcon() {
  return (
    <span aria-hidden="true" className="grid h-8 w-8 place-items-center sm:hidden">
      <span className="flex flex-col gap-1">
        <span className="h-[2px] w-5 bg-white" />
        <span className="h-[2px] w-5 bg-white" />
        <span className="h-[2px] w-5 bg-white" />
      </span>
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

function Field({ label, children }) {
  return (
    <label className="block text-sm font-bold text-[#606060]">
      {label}
      {children}
    </label>
  )
}

function Shape({ className }) {
  return <div aria-hidden="true" className={`absolute rounded-[48%] opacity-90 ${className}`} />
}

function BoxVolunteerArt() {
  return (
    <svg viewBox="0 0 520 360" className="mx-auto h-auto w-full max-w-[520px]" role="img" aria-label="Volunteer carrying a food box">
      <path d="M344 37c71 36 100 91 86 165-13 67-76 111-160 110-95-1-176-54-183-124-8-76 61-142 164-156 34-5 65-3 93 5Z" fill="#9fdcaf" />
      <path d="M156 132c0-58 47-104 105-104s105 46 105 104" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M206 56c24 24 73 34 121 19" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <circle cx="244" cy="125" r="6" fill="#111" />
      <circle cx="306" cy="125" r="6" fill="#111" />
      <path d="M241 158c22 16 52 16 75 0" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M177 185c24-29 57-44 99-44 43 0 78 16 105 48" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
      <path d="M119 203h155v111H119z" fill="#fff" stroke="#111" strokeWidth="8" />
      <path d="M274 203l92-44v111l-92 44z" fill="#f8f8f8" stroke="#111" strokeWidth="8" />
      <path d="M119 203l92-44 155 0-92 44z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M171 184c-31-24-49-51-56-82M378 185c35 20 60 49 75 86M448 268c25 1 47-8 67-28" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

function FoodBagArt() {
  return (
    <svg viewBox="0 0 460 280" className="relative z-10 h-auto w-full max-w-[460px]" role="img" aria-label="Hand placing surplus food into a donation box">
      <path d="M92 118h250v112H92z" fill="#fff" stroke="#111" strokeWidth="8" />
      <path d="M92 118l58-45h248l-56 45z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M342 118l56-45v112l-56 45z" fill="#f8f8f8" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M141 168h151M161 198h111" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M176 94h48v60h-48z" fill="#9fdcaf" stroke="#111" strokeWidth="7" />
      <path d="M184 116h32" stroke="#111" strokeWidth="6" strokeLinecap="round" />
      <path d="M244 86h46v68h-46z" fill="#fac06f" stroke="#111" strokeWidth="7" />
      <path d="M254 108h26M254 126h26" stroke="#111" strokeWidth="6" strokeLinecap="round" />
      <circle cx="128" cy="101" r="22" fill="#9fdcaf" stroke="#111" strokeWidth="7" />
      <path d="M304 46c31 7 59 22 85 45 17 16 15 39-6 51-21 12-51 11-91-3" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" />
      <path d="M379 91c23 6 41 18 54 36M73 88c29-24 61-34 96-29" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

function HandoffArt() {
  return (
    <svg viewBox="0 0 540 300" className="relative z-10 h-auto w-full max-w-[540px]" role="img" aria-label="Food drive pickup truck with donation boxes">
      <path d="M72 136h248v88H72z" fill="#fff" stroke="#111" strokeWidth="8" />
      <path d="M320 164h76l48 60H320z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
      <path d="M108 224a31 31 0 1 0 62 0M352 224a31 31 0 1 0 62 0" fill="none" stroke="#111" strokeWidth="8" />
      <path d="M111 92h78v70h-78zM209 84h78v78h-78z" fill="#fff" stroke="#111" strokeWidth="8" />
      <path d="M126 126h48M224 119h48" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M98 136c30-37 70-56 120-56 46 0 84 17 114 50" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
      <path d="M432 80h58v58h-58z" fill="#fff" stroke="#111" strokeWidth="7" />
      <path d="M432 100h58M448 68v22M474 68v22" stroke="#111" strokeWidth="6" strokeLinecap="round" />
      <path d="M462 118h1" stroke="#111" strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}
