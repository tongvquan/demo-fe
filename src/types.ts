export type OnlineUser = { id: string; name: string; online: boolean; lastSeen: number | null };
export type Person = { name: string; handle: string; initials: string; status: string; online: boolean; lastSeen: number | null };
export type Message = { id: string; sender: string; text: string; time: string; read?: boolean };
