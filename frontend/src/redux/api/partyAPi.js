
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";







export const partyApi = createApi({
  reducerPath: "partyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Party" ],
  endpoints: (builder) => ({


    // // ✅ Get all leads (paginated)
    // getAllLeads: builder.query({
    //   query: ({ userId, page }) => `lead/${userId}?page=${page}`,
    //   providesTags: (result) =>
    //     result && Array.isArray(result.data)
    //       ? [
    //           { type: "Lead", id: "LIST" },
    //           ...result.data.map((lead) => ({ type: "Lead", id: lead.id })),
    //         ]
    //       : [{ type: "Lead", id: "LIST" }],
    // }),

 
    // getAllParties: builder.query({
    //     query: ({page}) => `party/get-all-parties?page=${page}`,
    //     providesTags: ["Party"],
    // }),
 

    // getAllParties: builder.query({
    //   query:(args) => {
    //     const page = args?.page; // optional
    //     return page
    //       ? `party/get-all-parties?page=${page}`
    //       : `party/get-all-parties`; // no pagination param
    //   },
    //   providesTags: ["Party"],
    // }),
    getAllParties: builder.query({
  query: ({ page, search = "" } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    const queryString = params.toString();
    // return `party/get-all-parties?${params.toString()}`;
    return queryString
      ? `party/get-all-parties?${queryString}`
      : `party/get-all-parties`;
  },
  providesTags: ["Party"],
}),

    // ✅ Add a party
    addParty: builder.mutation({
      query: ({ body }) => ({
        url: `party/add-party`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Party", id: "LIST" },
      
      ],
    }),


    

  

  
   
   
  
  }),
});

 export const {
    useGetAllPartiesQuery,
    useAddPartyMutation
 }=partyApi
   
