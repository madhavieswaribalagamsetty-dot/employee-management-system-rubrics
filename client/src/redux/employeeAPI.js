
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const employeeAPI = createApi({
    reducerPath: "employeeAPI",

    baseQuery: fetchBaseQuery({
        baseUrl: "/api/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");

            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }

            return headers;
        }
    }),

    tagTypes: ["Employees"],

    endpoints: (builder) => ({
        getEmployees: builder.query({
            query: () => "employees",
            providesTags: ["Employees"]
        })
    })
});

export const { useGetEmployeesQuery } = employeeAPI;
