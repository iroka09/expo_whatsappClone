
import _chats from "@/data/chats.json"
import _conversations from "@/data/conversations2.json"
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import random from "random"
import moment from "moment-timezone"



export interface ChatListType {
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
}
type Id_Arr_Type = [number, "user" | "group"]


interface ConversationType {
  id: number;
  conversations: Array<{
    id: string,
    user: string | 1 | 2;
    data: Array<{
      id: string,
      message: string,
      timestamp: number
    }>;
    avatar: string;
    timestamp: number;
  }>;
};

interface ChatsStateType {
  chatsList: ChatListType[],
  unreadCount: { id: number, unreadCount: number },
  selectedChatsIds: Id_Arr_Type[];
  conversations: ConversationType[];
}


const initialState: ChatsStateType = {
  chatsList: _chats as ChatListType[],
  unreadCount: _chats.filter(x => x.unreadCount > 0).map(x => ({ id: x.id, unreadCount: x.unreadCount })),
  selectedChatsIds: [],
  conversations: JSON.parse(JSON.stringify(_conversations)).map(x => {
    //manipulate conversations timestamp to ensure that they are not all the same
    let prevTimestamp = moment("01-JAN-2015", "DD-MMMM-YYYY").valueOf();
    x.conversations.forEach((y, i) => {
      if (i > 0) {
        const nowDate = Date.now()
        if (nowDate > prevTimestamp) {
          const timestamp = random.int(prevTimestamp, nowDate)
          y.timestamp = timestamp
          prevTimestamp = y.timestamp
        }
      }
      return y
    })
    return x
  }) as ConversationType[]
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    toggleChatsSelection: (state, action: PayloadAction<Id_Arr_Type | "clear">) => {
      if (action.payload === "clear") {
        state.selectedChatsIds = []
        return
      }
      const id = action.payload[0]
      if (state.selectedChatsIds.some(arr => arr[0] === id))
        state.selectedChatsIds = state.selectedChatsIds.filter(arr => arr[0] !== id) //remove item
      else
        state.selectedChatsIds = [...state.selectedChatsIds, [...action.payload]]//add item
    },
    handleMarkChatAsRead(state, action: PayloadAction<number>) {
      state.unreadCount = state.unreadCount.filter(x => {
        if (x.id !== action.payload) return true
        return false
      })
    },
    handleAddNewUser(state, action: PayloadAction<ChatListType>) {
      const user = action.payload
      state.chatsList.push(user)
      state.unreadCount.push({ id: user.id, æunreadCount: user.unreadCount })
      /* state.chatsList = [...state.chatsList, user]
       state.unreadCount = [...state.unreadCount, { id: user.id, æunreadCount: user.unreadCount }] */
    },
  }
});

export const { toggleChatsSelection, handleMarkChatAsRead } = chatsSlice.actions;
export default chatsSlice.reducer;