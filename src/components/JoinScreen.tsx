import type { FormEvent } from "react";
type Props = {
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
export function JoinScreen({ username, onUsernameChange, onSubmit }: Props) {
  return (
    <main className="welcome-page join-screen">
      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <div className="hero-copy">
        <div className="hero-brand">✦ lucid.chat</div>
        <div className="hero-content">
          <p className="hero-kicker">A quieter way to connect</p>
          <h2>
            Good conversations
            <br />
            <em>start here.</em>
          </h2>
          <p className="hero-description">
            Join your people in a simple, focused space built for real-time conversations — no noise, no clutter.
          </p>
        </div>
      </div>
      <section className="join-card">
        <div className="brand-mark">✦</div>
        <p className="eyebrow">Realtime chat</p>
        <h1>Let's get you chatting.</h1>
        <p className="intro">Choose a username to join the conversation.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="username">Username</label>
          <div className="input-wrap">
            <span className="at-sign">@</span>
            <input
              id="username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="e.g. alex"
              maxLength={30}
              required
              autoFocus
            />
          </div>
          <button type="submit">
            Join chat <span>→</span>
          </button>
        </form>
        <p className="hint">
          <span className="hint-dot" />
          No password required
        </p>
      </section>
    </main>
  );
}
