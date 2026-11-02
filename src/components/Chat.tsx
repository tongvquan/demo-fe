import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createMessageSocket } from "../socket";
import type { Message, Person } from "../types";
type BackendMessage = Message & { from?: string; content?: string; createdAt?: string; readAt?: string | null };

export function Chat({
  userId,
  username,
  person,
  onBack,
}: {
  userId: string;
  username: string;
  person: Person;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof createMessageSocket> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const socket = createMessageSocket(userId);
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
    });
    socket.on("disconnect", () => setConnected(false));
    const addMessage = (message: BackendMessage) => {
      const sender = message.sender ?? message.from ?? "Someone";
      setMessages((current) => [...current, {
        id: message.id,
        sender,
        text: message.text ?? message.content ?? "",
        time: message.time ?? message.createdAt ?? new Date().toLocaleTimeString(),
        read: Boolean(message.read || message.readAt),
      }]);
      if (sender !== username && sender !== userId && message.id) {
        socket.emit("message:read", { messageId: message.id, userId });
      }
    };
    socket.on("message:new", addMessage);
    socket.on("message:read", (receipt: string | { messageId?: string; id?: string }) => {
      const messageId = typeof receipt === "string" ? receipt : receipt.messageId ?? receipt.id;
      if (!messageId) return;
      setMessages((current) => current.map((message) =>
        message.id === messageId ? { ...message, read: true } : message,
      ));
    });
    return () => {
      socket.disconnect();
    };
  }, [person.handle, username, userId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const send = (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !socketRef.current?.connected) return;
    socketRef.current.emit("message:send", { to: person.handle, content: value });
    setText("");
  };
  return (
    <main className="chat-page">
      <section className="chat-card">
        <header className="chat-header">
          <button className="back-button" onClick={onBack}>
            Back
          </button>
          <span className="person-avatar">{person.initials}</span>
          <div className="chat-person">
            <strong>{person.name}</strong>
            <small>
              <i className={person.online ? "status-online" : "status-offline"} />
              {person.status}
            </small>
          </div>
          {/* <span className="chat-brand">âœ¦ lucid.chat</span> */}
        </header>
        <div className="messages">
          <div className="conversation-start">
            <span>{person.initials}</span>
            <strong>{person.name}</strong>
            <small>{person.status}</small>
          </div>
          {messages.map((message) => (
            <div
              className={`message-row ${message.sender === username || message.sender === userId ? "mine" : ""}`}
              key={message.id}
            >
              <div className="message-bubble">
                <span>{message.text}</span>
                <small>{message.time}</small>
                {(message.sender === username || message.sender === userId) && message.read && (
                  <small className="message-status">Seen</small>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className="message-form" onSubmit={send}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            disabled={!connected}
          />
          <button disabled={!connected || !text.trim()}>Send</button>
        </form>
        <p className="chat-hint">Messages are sent in real time Â· signed in as @{username}</p>
      </section>
    </main>
  );
}
