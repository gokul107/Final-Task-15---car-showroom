import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

// Redux stores the IDs of cars saved to the visitor's garage.
function getSavedIds() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("saarthi-garage") ||
        localStorage.getItem("aarohan-garage") ||
        "[]",
    );
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

const garageSlice = createSlice({
  name: "garage",
  initialState: { savedIds: getSavedIds() },
  reducers: {
    toggleSaved(state, action: PayloadAction<string>) {
      const index = state.savedIds.indexOf(action.payload);
      if (index >= 0) state.savedIds.splice(index, 1);
      else state.savedIds.push(action.payload);
    },
    removeSaved(state, action: PayloadAction<string>) {
      state.savedIds = state.savedIds.filter((id) => id !== action.payload);
    },
  },
});

export const { toggleSaved, removeSaved } = garageSlice.actions;
export const store = configureStore({
  reducer: { garage: garageSlice.reducer },
});
store.subscribe(() =>
  localStorage.setItem(
    "saarthi-garage",
    JSON.stringify(store.getState().garage.savedIds),
  ),
);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
