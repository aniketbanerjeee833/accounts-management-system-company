import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";







export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/",
    credentials: "include",
  }),
  tagTypes: ["Sale" , "New-Sale","Invoice","Invoice-New-Sale"],
  endpoints: (builder) => ({




    addInvoice: builder.mutation({
      query: ({ body }) => ({
        
        url: `sale/add-invoice`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
          "Invoice" 
      ]
    }),

    updateInvoice: builder.mutation({
      query: ({ body }) => ({
        
        url: `sale/update-invoice`,
        method: "PUT",
        body,
      }),
  
    invalidatesTags: [
      "Invoice" 
    ]
      }),
      getSingleInvoice: builder.query({
        query: () => `sale/get-single-invoice`,
        providesTags: ["Invoice"],
      }),


      
    addNewSaleInvoice: builder.mutation({
      query: ({ body }) => ({
        
        url: `sale/add-new-sale-invoice`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
          "Invoice-New-Sale" 
      ]
    }),

    updateNewSaleInvoice: builder.mutation({
      query: ({ body }) => ({
        
        url: `sale/update-new-sale-invoice`,
        method: "PUT",
        body,
      }),
  
    invalidatesTags: [
      "Invoice-New-Sale" 
    ]
      }),
      getNewSaleSingleInvoice: builder.query({
        query: () => `sale/get-single-new-sale-invoice`,
        providesTags: ["Invoice-New-Sale"],
      }),
    // ✅ Add a party
    addSale: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `sale/add-sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
      
      ],
    }),

      addNewSale: builder.mutation({
    
      query: ({ body }) => ({
        
        url: `sale/add-new-sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "New-Sale", id: "LIST" },
      
      ],
    }),

    editSale: builder.mutation({
      query: ({ body,Sale_Id }) => ({
        
        url: `sale/edit-sale/${Sale_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
      
      ],
    }),
 editNewSale: builder.mutation({
      query: ({ body,Sale_Id }) => ({
        
        url: `sale/edit-new-sale/${Sale_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "New-Sale", id: "LIST" },
      
      ],
    }),

   getAllSales: builder.query({
  query: ({ page, search = "", fromDate = "", toDate = "" }) => {
    const params = new URLSearchParams();

    params.append("page", page); // always present
    if (search) params.append("search", search);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return `sale/get-all-sales?${params.toString()}`;
  },
  providesTags: [{ type: "Sale", id: "LIST" }],
}),
 getAllNewSales: builder.query({
  query: ({ page, search = "", fromDate = "", toDate = "" }) => {
    const params = new URLSearchParams();

    params.append("page", page); // always present
    if (search) params.append("search", search);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return `sale/get-all-new-sales?${params.toString()}`;
  },
  providesTags: [{ type: "New-Sale", id: "LIST" }],
}),


      getLatestInvoiceNumber: builder.query({
        query: () => `sale/get-latest-invoice-number`,
        provideTaags: [{
          type: "Sale",
          id: "LIST"
        }],
      }),
        getLatestNewSaleInvoiceNumber: builder.query({
        query: () => `sale/get-latest-new-sale-invoice-number`,
        provideTaags: [{
          type: "New-Sale",
          id: "LIST"
        }],
      }),
      getSingleSale:builder.query({
        query: (Sale_Id) => `sale/get-single-sale/${Sale_Id}`,
        providesTags: ["Sale"],
      }),
   printSaleBill: builder.mutation({
  query: (sale) => ({
    url: `sale/print-sale-invoice`,
    method: "POST",
    body: sale, // ✅ Send directly, not {body: sale}
     
      responseHandler: (response) => response.blob(), // 👈 This is the fix
  }),
  invalidatesTags: ["Sale"],
}),

getTotalNewSalesEachDay: builder.query({
  query: () => `/sale/total-new-sales-by-day`,
  providesTags: ["New-Sale"],
   
}),
getTotalSalesEachDay: builder.query({
  query: () => `/sale/total-sales-by-day`,
  providesTags: ["New-Sale"],
   
}),
  
  }),
});

 export const {
   
  useAddInvoiceMutation,
    useUpdateInvoiceMutation,
    useGetSingleInvoiceQuery,

    useAddNewSaleInvoiceMutation,
    useUpdateNewSaleInvoiceMutation,
    useGetNewSaleSingleInvoiceQuery,

    useAddSaleMutation,
    useAddNewSaleMutation,
    useEditSaleMutation,

    useEditNewSaleMutation,
    useGetAllSalesQuery,
    useGetAllNewSalesQuery,

    useGetLatestInvoiceNumberQuery,
    useGetLatestNewSaleInvoiceNumberQuery,
    
    useGetSingleSaleQuery,
    usePrintSaleBillMutation,

    useGetTotalNewSalesEachDayQuery,
    useGetTotalSalesEachDayQuery
   
 }=saleApi
   
