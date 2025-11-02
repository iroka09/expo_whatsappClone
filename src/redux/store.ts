import { configureStore } from "@reduxjs/toolkit";
import chatsTabReducer from "./reducers/chats_tab_reducer";

export const store = configureStore({
  reducer: {
    chats: chatsTabReducer,
  },
});


store.subscribe(() => {
  // console.log(store.getState())
})

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;