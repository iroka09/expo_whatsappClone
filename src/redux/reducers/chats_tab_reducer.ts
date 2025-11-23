import { createSlice, PayloadAction } from "@reduxjs/toolkit";


type Id_Arr_Type = [number, "user" | "group"]

interface ChatsStateType {
  selectedChatsIds: Id_Arr_Type[];
}

const initialState: ChatsStateType = {
  selectedChatsIds: [],
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
    }
  }
});

export const { toggleChatsSelection } = chatsSlice.actions;
export default chatsSlice.reducer;