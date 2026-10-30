import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { createJoinSocket } from "./socket";
import type { OnlineUser, Person } from "./types";
import { Chat } from "./components/Chat";
import { Directory } from "./components/Directory";
import { JoinScreen } from "./components/JoinScreen";
export default function App() {
  const [username, setUsername] = useState("");
  const [joinedAs, setJoinedAs] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [selected, setSelected] = useState("");
  const [chatting, setChatting] = useState(false);
  useEffect(() => {
    if (!joinedAs) return;
    const socket = createJoinSocket();
    socket.on("connect", () => socket.emit("join", { username: joinedAs }));
    socket.on("users:updated", (nextUsers: OnlineUser[]) => {
      setCurrentUserId(nextUsers.find((user) => user.name === joinedAs)?.id ?? "");
      setUsers(nextUsers.filter((user) => user.name !== joinedAs));
    });
    socket.on("user:joined", (user: OnlineUser) => {
      if (user.name !== joinedAs) {
        setUsers((current) => (current.some((item) => item.id === user.id) ? current : [...current, user]));
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [joinedAs]);
  const people: Person[] = useMemo(
    () =>
      users.map((user) => ({
        name: user.name,
        handle: user.id,
        initials: user.name.slice(0, 2).toUpperCase(),
        status: "Available to chat",
      })),
    [users],
  );
  const person = people.find((item) => item.handle === selected);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = username.trim();
    if (name) {
      setJoinedAs(name);
      setSelected("");
      setChatting(false);
    }
  };
  if (!joinedAs) return <JoinScreen username={username} onUsernameChange={setUsername} onSubmit={submit} />;
  if (chatting && person && currentUserId) {
    return <Chat userId={currentUserId} username={joinedAs} person={person} onBack={() => setChatting(false)} />;
  }
  return (
    <Directory
      username={joinedAs}
      people={people}
      selected={selected}
      onSelect={setSelected}
      onStart={() => setChatting(true)}
      onChangeName={() => {
        setJoinedAs("");
        setUsers([]);
      }}
    />
  );
}
