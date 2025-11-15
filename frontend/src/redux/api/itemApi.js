import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";







export const itemApi = createApi({
  reducerPath: "itemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Item" ,"New-Item"],
  endpoints: (builder) => ({



getAllItems: builder.query({
  query: ({ page, search = "", fromDate = "", toDate = "" } = {}) => {
    const params = new URLSearchParams();

    // ✅ Append only when defined
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const queryString = params.toString();
    return queryString
      ? `item/get-all-items?${queryString}`
      : `item/get-all-items`;
  },
  providesTags: ["Item"],
}),
getAllNewItems: builder.query({
  query: ({ page, search = "", fromDate = "", toDate = "" } = {}) => {
    const params = new URLSearchParams();

    // ✅ Append only when defined
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const queryString = params.toString();
    return queryString
      ? `item/get-all-new-items?${queryString}`
      : `item/get-all-new-items`;
  },
  providesTags: ["New-Item"],
}),
    // ✅ Add a party
    addItem: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `item/add-item`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Item", id: "LIST" },
      
      ],
    }),

    addNewSaleItem: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `item/add-new-sale-item`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "New-Item", id: "LIST" },
      
      ],
    }),
    addCategory: builder.mutation({
      query: ({ body }) => ({
        url: `item/add-category`,
        method: "POST",
        body,
      }),
     invalidatesTags:["Category"],
    }),

    getAllCategories: builder.query({
        query: () => `item/get-all-categories`,
        providesTags: ["Category"],
    }),
    

  

  
   
   
  
  }),
});

 export const {
    useGetAllItemsQuery,
    useGetAllNewItemsQuery,
    useAddItemMutation,
    useAddNewSaleItemMutation,
    useAddCategoryMutation,
    useGetAllCategoriesQuery
 }=itemApi
   
