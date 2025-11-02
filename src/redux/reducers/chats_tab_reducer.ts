import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatsStateType {
  selectedChatsIds: number[];
}

const initialState: ChatsStateType = {
  selectedChatsIds: [],
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    toggleChatsSelection: (state, action: PayloadAction<number | "clear">) => {
      const id = action.payload
      if (id === "clear"){
        state.selectedChatsIds = []
        return
      }
      if (state.selectedChatsIds.includes(id))
        state.selectedChatsIds = state.selectedChatsIds.filter(x => x !== id)
      else
        state.selectedChatsIds = [...state.selectedChatsIds, id]
    }
  }
});

export const { toggleChatsSelection } = chatsSlice.actions;
export default chatsSlice.reducer;