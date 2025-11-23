
import _chats from "@/data/chats.json"
import { useState, useEffect, createContext, useContext } from "react"


export type ChatsType = Array<{
  id: number;
  type: "user" | "group";
  name: string | null;
  phone?: string;//for type=user
  avatar: {
    lowQuality: string;
    highQuality: string;
  },
  lastMessage: {
    text: string;
    fromMe: boolean;
    status?: "sent" | "delivered" | "read";//for fromMe=true
  },
  date: string;
  hasStatus: boolean;
  unreadCount: number;
}>

export const chats = _chats as ChatsType


const ChatsContext = createContext(null)


export default function ChatsListProvider({ children }) {
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  useEffect(() => {
    let num = chats.filter(x => x.unreadCount > 0).length
    setNewMessagesCount(num)
  }, [chats])
  return (
    <ChatsContext.Provider
      value={{
        newMessagesCount
      }}
    >
      {children}
    </ChatsContext.Provider>
  )
}


export const useChatsList = () => {
  return useContext(ChatsContext)
} 