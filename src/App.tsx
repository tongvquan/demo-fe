import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { io, type Socket } from 'socket.io-client'
import './App.css'

type Person = { name: string; handle: string; initials: string; status: string }

type Message = { id: string; sender: string; text: string; time: string }
type IncomingMessage = Partial<Message> & { message?: string; username?: string; user?: string; content?: string }
type OnlineUser = { id: string; name: string }
const API_URL = "http://localhost:3000/api"

async function readApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json() as Promise<T>
}

function normalizeUsers(payload: unknown): OnlineUser[] {
  const values = Array.isArray(payload) ? payload : (payload as { data?: unknown })?.data
  if (!Array.isArray(values)) return []
  return values.map((item, index) => {
    if (typeof item === 'string') return { id: item, name: item }
    const user = item as { id?: string; name?: string; username?: string; user?: string }
    const name = user.name ?? user.username ?? user.user ?? user.id ?? `user-${index}`
    return { id: user.id ?? name, name }
  })
}

function normalizeMessage(payload: IncomingMessage): Message | null {
  const text = payload.text ?? payload.message ?? payload.content
  if (!text) return null
  return { id: payload.id ?? `${Date.now()}-${Math.random()}`, sender: payload.sender ?? payload.username ?? payload.user ?? 'Someone', text, time: payload.time ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
}

function Chat({ username, person, onBack }: { username: string; person: Person; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false
    readApi<unknown>(`/messages?me=${encodeURIComponent(username)}&peer=${encodeURIComponent(person.handle)}`)
      .then(payload => {
        if (!cancelled) {
          const values = Array.isArray(payload) ? payload : (payload as { data?: unknown })?.data
          setMessages(Array.isArray(values) ? values.map(item => normalizeMessage(item as IncomingMessage)).filter((item): item is Message => item !== null) : [])
        }
      })
      .catch(error => console.error('Could not load conversation history', error))
    const socket = io(API_URL, { transports: ['websocket', 'polling'] }); socketRef.current = socket
    socket.on('connect', () => { setConnected(true); socket.emit('join', { username, room: person.handle, participant: person.handle }) })
    socket.on('disconnect', () => setConnected(false))
    const receive = (payload: IncomingMessage) => { const message = normalizeMessage(payload); if (message) setMessages(current => [...current, message]) }
    socket.on('receive_message', receive); socket.on('message', receive)
    return () => {
      socket.off('receive_message', receive)
      socket.off('message', receive)
      socket.disconnect()
      cancelled = true
    }
  }, [username, person.handle])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  const sendMessage = (event: FormEvent) => {
    event.preventDefault(); const value = text.trim(); if (!value || !socketRef.current?.connected) return
    socketRef.current.emit('send_message', { sender: username, username, receiver: person.handle, room: person.handle, text: value, message: value })
    setMessages(current => [...current, { id: `${Date.now()}`, sender: username, text: value, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); setText('')
  }
  return <main className="chat-page"><section className="chat-card"><header className="chat-header"><button className="back-button" onClick={onBack}>←</button><span className="person-avatar">{person.initials}</span><div className="chat-person"><strong>{person.name}</strong><small><i className={connected ? 'status-online' : ''} />{connected ? 'Online now' : 'Connecting...'}</small></div><span className="chat-brand">✦ lucid.chat</span></header><div className="messages" aria-live="polite"><div className="conversation-start"><span>{person.initials}</span><strong>{person.name}</strong><small>{person.status}</small></div>{messages.map(message => <div className={`message-row ${message.sender === username ? 'mine' : ''}`} key={message.id}><div className="message-bubble"><span>{message.text}</span><small>{message.time}</small></div></div>)}<div ref={bottomRef} /></div><form className="message-form" onSubmit={sendMessage}><input value={text} onChange={event => setText(event.target.value)} placeholder={connected ? 'Write a message...' : 'Connecting to chat...'} disabled={!connected} /><button disabled={!connected || !text.trim()}>↑</button></form><p className="chat-hint">Messages are sent in real time · signed in as @{username}</p></section></main>
}

function App() {
  const [username,       setUsername]       = useState('')
  const [joinedAs,       setJoinedAs]       = useState('')
  const [selectedPerson, setSelectedPerson] = useState('')
  const [chatting, setChatting] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  useEffect(() => {
    if (!joinedAs) return
    let cancelled = false
    const loadUsers = () => readApi<unknown>('/users')
      .then(payload => { if (!cancelled) setOnlineUsers(normalizeUsers(payload).filter(user => user.name !== joinedAs)) })
      .catch(error => console.error('Could not load users', error))
    loadUsers()
    return () => { cancelled = true }
  }, [joinedAs])
  const onlinePeople = onlineUsers.map(user => ({ name: user.name, handle: user.id, initials: user.name.slice(0, 2).toUpperCase(), status: 'Available to chat' }))
  const person = onlinePeople.find(item => item.handle === selectedPerson)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = username.trim()
    if (!name) return
    try {
      await readApi('/users', { method: 'POST', body: JSON.stringify({ username: name }) })
      setJoinedAs(name)
    } catch (error) {
      console.error('Could not register user', error)
    }
  }
  if (chatting && person) return <Chat username={joinedAs} person={person} onBack={() => setChatting(false)} />

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
            {onlinePeople.length === 0 && <li className="empty-people">No one else is online yet.</li>}
            {onlinePeople.map(({ name, handle, initials, status }) => {
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
            onClick={() => setChatting(true)}
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
