
import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./employeeSlice";
import { employeeAPI } from "./employeeAPI";

export const store = configureStore({
    reducer: {
        employees: employeeReducer,
        [employeeAPI.reducerPath]: employeeAPI.reducer
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(employeeAPI.middleware)
});

export default store;
