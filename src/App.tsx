import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const PEOPLE = [
  { name: 'Maya Chen',     handle: 'maya.chen',   initials: 'MC', status: 'Designing the future' },
  { name: 'Noah Williams', handle: 'noah.w',       initials: 'NW', status: 'Building something new' },
  { name: 'Lena Ortiz',   handle: 'lena.ortiz',   initials: 'LO', status: 'Usually online' },
] as const

function App() {
  const [username,       setUsername]       = useState('')
  const [joinedAs,       setJoinedAs]       = useState('')
  const [selectedPerson, setSelectedPerson] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = username.trim()
    if (name) setJoinedAs(name)
  }

  /* ── Directory page ──────────────────────────────────── */
  if (joinedAs) {
    return (
      <main className="welcome-page directory-page">
        <section className="directory-card" aria-labelledby="people-title">

          {/* Top bar */}
          <div className="directory-top">
            <div className="small-brand">
              <div className="small-brand-icon" aria-hidden="true">✦</div>
              <span className="small-brand-name">lucid.chat</span>
            </div>
            <div className="signed-in" aria-label={`Signed in as ${joinedAs}`}>
              <span className="signed-in-dot" aria-hidden="true" />
              @{joinedAs}
            </div>
          </div>

          <p className="eyebrow">Who do you want to chat with?</p>
          <h1 id="people-title">Choose someone<br />to connect.</h1>
          <p className="intro">
            Select a person below to start a real-time conversation.
          </p>

          {/* People list */}
          <ul className="people-list" role="list" aria-label="Available contacts">
            {PEOPLE.map(({ name, handle, initials, status }) => {
              const isSelected = selectedPerson === handle
              return (
                <li key={handle}>
                  <button
                    className={`person${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedPerson(handle)}
                    aria-pressed={isSelected}
                    aria-label={`${name}, ${status}${isSelected ? ', selected' : ''}`}
                  >
                    <span className="person-avatar" aria-hidden="true">{initials}</span>
                    <span className="person-info">
                      <strong>{name}</strong>
                      <small>@{handle} · {status}</small>
                    </span>
                    <span className="online-dot" aria-label="Online" />
                    {isSelected && (
                      <span className="check-icon" aria-hidden="true">✓</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <button
            className="start-button"
            disabled={!selectedPerson}
            aria-disabled={!selectedPerson}
          >
            Start chat
            <span className="btn-arrow" aria-hidden="true">→</span>
          </button>

          <button
            className="change-name"
            onClick={() => { setJoinedAs(''); setSelectedPerson('') }}
          >
            ← Use a different username
          </button>

        </section>
      </main>
    )
  }

  /* ── Join / landing page ─────────────────────────────── */
  return (
    <main className="welcome-page join-screen">

      {/* Decorative orbs */}
      <div className="glow glow-one" aria-hidden="true" />
      <div className="glow glow-two" aria-hidden="true" />

      {/* Hero copy — hidden on small screens via CSS */}
      <div className="hero-copy" aria-hidden="true">
        <div className="hero-brand">
          <div className="hero-brand-icon">✦</div>
          lucid.chat
        </div>

        <div className="hero-content">
          <p className="hero-kicker">A quieter way to connect</p>
          <h2>
            Good conversations<br />
            <em>start here.</em>
          </h2>
          <p className="hero-description">
            Join your people in a simple, focused space built
            for real-time conversations — no noise, no clutter.
          </p>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true">
              <span>MC</span>
              <span>NW</span>
              <span>LO</span>
            </div>
            <span>Made for meaningful conversations</span>
          </div>
        </div>

        <p className="hero-footer">REALTIME · SIMPLE · HUMAN</p>
      </div>

      {/* Join card */}
      <section className="join-card" aria-labelledby="page-title">

        <div className="brand-mark" aria-hidden="true">✦</div>

        <p className="eyebrow">Realtime chat</p>
        <h1 id="page-title">Let's get you chatting.</h1>
        <p className="intro">Choose a username to join the conversation.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">Username</label>
          <div className="input-wrap">
            <span className="at-sign" aria-hidden="true">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. alex"
              autoComplete="username"
              maxLength={30}
              required
              autoFocus
              aria-required="true"
            />
          </div>
          <button type="submit">
            Join chat
            <span aria-hidden="true">→</span>
          </button>
        </form>

        {joinedAs && (
          <p className="success" role="status" aria-live="polite">
            You're in as <strong>@{joinedAs}</strong>. Chat is ready.
          </p>
        )}

        <p className="hint">
          <span className="hint-dot" aria-hidden="true" />
          No password required
        </p>

      </section>

      <p className="footer-note">A simple space to connect, in real time.</p>

    </main>
  )
}

export default App
