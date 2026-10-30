import type { Person } from "../types";
type Props = {
  username: string;
  people: Person[];
  selected: string;
  onSelect: (handle: string) => void;
  onStart: () => void;
  onChangeName: () => void;
};
export function Directory({ username, people, selected, onSelect, onStart, onChangeName }: Props) {
  return (
    <main className="welcome-page directory-page">
      <section className="directory-card">
        <div className="directory-top">
          <div className="small-brand">✦ lucid.chat</div>
          <div className="signed-in">
            <span className="signed-in-dot" />@{username}
          </div>
        </div>
        <p className="eyebrow">Who do you want to chat with?</p>
        <h1>
          Choose someone
          <br />
          to connect.
        </h1>
        <p className="intro">Select a person below to start a real-time conversation.</p>
        <ul className="people-list">
          {people.length === 0 && <li className="empty-people">No one else is online yet.</li>}
          {people.map((person) => (
            <li key={person.handle}>
              <button
                className={`person${selected === person.handle ? " selected" : ""}`}
                onClick={() => onSelect(person.handle)}
              >
                <span className="person-avatar">{person.initials}</span>
                <span className="person-info">
                  <strong>{person.name}</strong>
                  <small>
                    @{person.handle} · {person.status}
                  </small>
                </span>
                <span className="online-dot" />
                {selected === person.handle && <span className="check-icon">✓</span>}
              </button>
            </li>
          ))}
        </ul>
        <button className="start-button" disabled={!selected} onClick={onStart}>
          Start chat <span>→</span>
        </button>
        <button className="change-name" onClick={onChangeName}>
          ← Use a different username
        </button>
      </section>
    </main>
  );
}
