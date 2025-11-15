// import { configureStore } from "@reduxjs/toolkit"

// import userSlice from "./reducer/userReducer"
// const store=configureStore({
//     reducer:{
      
//     user:userSlice
       
       
        
//     }
// })

// export default store
// // src/redux/store.js
// import { configureStore } from "@reduxjs/toolkit";
// import userReducer from "./reducer/userReducer";
// import leadReducer from "./reducer/leadReducer";

// import { staffApi } from "./api/staffAPI";
// import { userApi } from "./api/userApi";
// import { adminApi } from "./api/adminApi";
// import { leadApi } from "./api/leadAPI";


//  const store = configureStore({
//   reducer: {
//     user: userReducer,
//     lead:leadReducer,
//     [userApi.reducerPath]: userApi.reducer,
//     [leadApi.reducerPath]: leadApi.reducer,
//     [staffApi.reducerPath]: staffApi.reducer,
//     [adminApi.reducerPath]: adminApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(userApi.middleware, leadApi.middleware, staffApi.middleware
//       ,adminApi.middleware
//     ),
// });
// export default store;
// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage for web
import userReducer from "./reducer/userReducer";

import { partyApi } from "./api/partyAPi";
import { itemApi } from "./api/itemApi";
import { purchaseApi } from "./api/purchaseApi";
import { saleApi } from "./api/saleApi";
import { dashboardApi } from "./api/dashboardApi";
import { userApi } from "./api/userApi";
import { reportApi } from "./api/reportApi";


// ✅ Combine reducers
const rootReducer = combineReducers({
  
   user: userReducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [partyApi.reducerPath]: partyApi.reducer,
  [itemApi.reducerPath]: itemApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [saleApi.reducerPath]: saleApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer
 
});

// ✅ Persist config (only persist user slice)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only user slice is persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }).concat(
      dashboardApi.middleware,
      partyApi.middleware,
      saleApi.middleware,
      itemApi.middleware,
      purchaseApi.middleware,
      userApi.middleware,
      reportApi.middleware
     
    ),
});

export const persistor = persistStore(store);
export default store;
