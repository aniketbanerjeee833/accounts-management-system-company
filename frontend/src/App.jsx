import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter, Navigate, useLocation, Outlet } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout';
import { useGetUserQuery } from './redux/api/userApi';
import Spinner from './components/Layout/Spinner';




// 🧩 Lazy imports
const Header = lazy(() => import('./components/Header/Header'));
const Login = lazy(() => import('./pages/User/Login/Login'));

const Dashboard = lazy(() => import('./pages/Dashboard'));

const Reports = lazy(() => import('./pages/Reports'));
const DayWiseReport = lazy(() => import('./pages/DayWiseReport'));
const DateRangeReport = lazy(() => import('./pages/DateRangeReport'));

const AddCategory = lazy(() => import('./pages/Items/AddCategories'));
const PartyAdd = lazy(() => import('./pages/Party/PartyAdd'));
const Items = lazy(() => import('./pages/Items/Items'));
const AllItemsList = lazy(() => import('./pages/Items/AllItemsList'));
const AllNewItemsList = lazy(() => import('./pages/Items/AllNewItemsList'));
const AllPartiesList = lazy(() => import('./pages/Party/AllPartiesList'));
const PurchaseAdd = lazy(() => import('./pages/Purchase/PurchaseAdd'));
const PurchaseView = lazy(() => import('./pages/Purchase/PurchaseView'));
const AllPurchasesList = lazy(() => import('./pages/Purchase/AllPurchaseList'));
const PurchaseEdit = lazy(() => import('./pages/Purchase/PurchaseEdit'));
const Invoice = lazy(() => import('./pages/Sale/Invoice'));
const AllSaleList = lazy(() => import('./pages/Sale/AllSaleList'));

const AllNewSaleList = lazy(() => import('./pages/Sale/AllNewSaleList'));
const SaleAdd = lazy(() => import('./pages/Sale/SaleAdd'));

const AddSale = lazy(() => import('./pages/Sale/AddSale'));
const SaleView = lazy(() => import('./pages/Sale/SaleView'));
const SaleEdit = lazy(() => import('./pages/Sale/SaleEdit'));
const NewSaleEdit = lazy(() => import('./pages/Sale/NewSaleEdit'));




// ==========================================
// 🔒 Auth Route Guards
// ==========================================




function ProtectedRoute() {
  const location = useLocation();
  const { data, isLoading, isError } = useGetUserQuery(undefined, {
    skip: location.pathname === "/login", // ⛔ Skip fetch on login
  });

  if (isLoading) return <div>Loading...</div>;

  const isAuthenticated = data?.authenticated || data?.user;

  if (isError || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// 🔓 Public Route — prevent logged-in users from accessing /login
function PublicRoute() {
  const location = useLocation();
  const { data, isLoading } = useGetUserQuery(undefined, {
    skip: location.pathname !== "/login", // ✅ Only run this check on login page
  });

  if (isLoading) return <div>Loading...</div>;

  const isAuthenticated = data?.authenticated;

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function RouterWrapper() {
  const location = useLocation();
  console.log(location);
  const hideHeader = location.pathname === "/login" || 
  location.pathname.startsWith("/day-wise-report") ||
  location.pathname.startsWith("/date-range-report");

  return (
    <>
      {!hideHeader && <Header />}
    <Suspense fallback={<Spinner size="lg" text="Loading Dashboard..." />}>
        <Routes>
          {/* Public Route: Login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/home"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route
              path="/items/add-category"
              element={
                <Layout>
                  <AddCategory />
                </Layout>
              }
            />
            <Route
              path="/items/add"
              element={
                <Layout>
                  <Items />
                </Layout>
              }
            />
            <Route
              path="/items/all-items"
              element={
                <Layout>
                  <AllItemsList />
                </Layout>
              }
            />
              <Route
              path="/items/all-new-items"
              element={
                <Layout>
                  <AllNewItemsList/>
                </Layout>
              }
            />
            <Route
              path="/party/add"
              element={
                <Layout>
                  <PartyAdd />
                </Layout>
              }
            />
            <Route
              path="/party/all-parties"
              element={
                <Layout>
                  <AllPartiesList />
                </Layout>
              }
            />
            <Route
              path="/sale/invoice"
              element={
                <Layout>
                  <Invoice />
                </Layout>
              }
            />
            <Route
              path="/sale/add"
              element={
               
                  <SaleAdd />
              
              }
            />
             <Route
              path="/new/sale/add"
              element={
               
                  <AddSale />
              
              }
            />
             <Route
              path="/sale/edit/:id"
              element={
               
                  <SaleEdit />
              
              }
            /> <Route
              path="/new/sale/edit/:id"
              element={
               
                  <NewSaleEdit/>
              
              }
            />
            <Route
              path="/sale/all-sales"
              element={
                <Layout>
                  <AllSaleList />
                </Layout>
              }
            />
             <Route
              path="/sale/all-new-sales"
              element={
                <Layout>
                  <AllNewSaleList />
                </Layout>
              }
            />
              <Route
              path="/sale/view/:id"
              element={
               
                  <SaleView />
             
              }
            />
            <Route
              path="/purchase/add"
              element={
             
                  <PurchaseAdd />
                
              }
            />
              <Route
              path="/purchase/edit/:id"
              element={
             
                  <PurchaseEdit />
                
              }
            />
            <Route
              path="/purchase/view/:id"
              element={
               
                  <PurchaseView />
             
              }
            />
            <Route
              path="/purchase/all-purchases"
              element={
                <Layout>
                  <AllPurchasesList />
                </Layout>
              }
            />
             <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
              <Route
              path="/day-wise-report/:date"
              element={
                
                  <DayWiseReport/>
              
              }
            />
            <Route
             path="/date-range-report/:fromDate/:toDate" 
            element={<DateRangeReport/>} 
            />

 

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  );
}
// ✅ PublicRoute – Prevent logged-in users from seeing /login
// function PublicRoute() {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await axios.get('/api/user/getUser', { withCredentials: true });
//         setIsAuthenticated(res.data.authenticated);
//       } catch {
//         setIsAuthenticated(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   if (isAuthenticated === null) return <div>Loading...</div>;
//   return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
// }
// return(
//   <BrowserRouter>
// <Header/>
//   <Routes>
//     <Route
//             path="/login"
//             element={
           
//                 <Login />
            
              
//             }
//           />
//     <Route path="/" element={
//       <Layout>
//       <Dashboard/>
//       </Layout>
//       } />
//     {/* <Route path="/items/add" element={<Items/>} /> */}

//      <Route
//           path="/items/add-category"
//           element={
//             <Layout>
//               <AddCategory />
//             </Layout>
//           }
//         />
//       <Route 
       
//           path="/items/add"
//           element={
//             <Layout>
//               <Items />
//             </Layout>
//           }
//         />
//       <Route 
//       path="/items/all-items"
//        element={
//         <Layout>
//         <AllItemsList/>
//         </Layout>
//         } 
//         />
   

    
//        <Route path="/party/add" element={
//         <Layout>
//         <PartyAdd/>
//         </Layout>
//         } />
//         <Route path="/party/all-parties" element={
//           <Layout>
//           <AllPartiesList/>
//           </Layout>
//           } />
//            <Route path="/sale/invoice" element={
//           <Layout>
//           <Invoice/>
//           </Layout>
//           } />
          
//             <Route path="/sale/add" element={
     
//       <SaleAdd/>
    
//       } />
//           <Route path="/sale/all-sales" element={
//           <Layout>
//           <AllSaleList/>
//           </Layout>
//           } />

//         <Route path="/purchase/add" element={
//           // <Layout>
//           <PurchaseAdd/>
//           // </Layout>
//           } />
//             <Route path="/purchase/view/:id" element={
//           // <Layout>
//           <PurchaseView/>
//           // </Layout>
//           } />
//               <Route path="/purchase/all-purchases" element={
//           <Layout>
//           <AllPurchasesList/>
//           </Layout>
//           } />
//   </Routes>
 
//       <ToastContainer position="top-right" autoClose={3000} />
// </BrowserRouter>
// )