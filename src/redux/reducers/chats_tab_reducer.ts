
import _chats from "@/data/chats.json"
import _conversations from "@/data/conversations.json"
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
    let prevTimestamp = moment("01-JAN-2015", "DD-MMM-YYYY").valueOf();
    x.conversations.forEach((y, i) => {
      if (i > 0) {
        const nowDate = Math.min(moment(prevTimestamp).add(2, "year").valueOf(), Date.now());
        const timestamp = random.int(prevTimestamp, nowDate)
        y.timestamp = timestamp
        prevTimestamp = timestamp
      }
      else y.timestamp = prevTimestamp
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
    handleAddNewConversationChat(state, action: PayloadAction<{ id: number, message: string }>) {
      const { id, message } = action.payload
      state.conversations.forEach(conversation => {
        //console.log(typeof id)
        if (conversation.id === id) {
          const lastMessageIndex = conversation.conversations.length - 1
          const lastMessageIsFromMe = conversation.conversations[lastMessageIndex]?.user === 1
          if (lastMessageIsFromMe) {
            conversation.conversations[lastMessageIndex].data.push({
              id: Math.random().toString(16).slice(-6),
              message,
              timestamp: Date.now()
            })
          } else {
            conversation.conversations.push({
              id: Math.random().toString(16).slice(-6),
              user: 1,
              data: [{
                id: Math.random().toString(16).slice(-6),
                message,
                timestamp: Date.now(),
              }],
              avatar: "",
              timestamp: Date.now()
            })
          }
        }
      })
    },
  }
});

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
export const { toggleChatsSelection, handleAddNewUser, handleMarkChatAsRead, handleAddNewConversationChat } = chatsSlice.actions;
export default chatsSlice.reducer;