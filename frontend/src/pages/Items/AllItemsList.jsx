import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetAllItemsQuery } from "../../redux/api/itemApi";


import { LayoutDashboard } from "lucide-react";

export default function AllItemsList() {

    const [page, setPage] = useState(1);

  
    const navigate = useNavigate();
 const [selectedItem, setSelectedItems] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 search text
  const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
        const { data: items, isLoading } = useGetAllItemsQuery({
          page,
  search:searchTerm,
  fromDate,
  toDate,
});
  
    const handleItemClick = (itemId) => {
        const party = items?.items?.find((p) => p.Item_Id === itemId);
        setSelectedItems(party);
    };
    const handlePageChange = (newPage) => {
        setPage(newPage);
    }
    const handleNextPage = () => {
        setPage(page + 1);
    }
    const handlePreviousPage = () => {
        setPage(page - 1);
    }
    useEffect(() => {
        if (items && items?.items?.length > 0) {
            setSelectedItems(items?.items[0]);
        }
    }, [items]);


    // Set first party as default when data is loaded
// const filteredItems = useMemo(() => {
//   if (!items?.items) return [];
//   if (!searchTerm.trim()) return items.items;

//   const lowerSearch = searchTerm.toLowerCase();
//   return items.items.filter((item) => {
//     return (
       
      
//       (item?.Item_Name && item.Item_Name.toLowerCase().includes(lowerSearch)) ||
//       (item?.Stock_Quantity &&
//         item.Stock_Quantity.toString().toLowerCase().includes(lowerSearch)) ||
//       (item?.Purchase_Price &&
//         item.Purchase_Price.toString().toLowerCase().startsWith(lowerSearch)) ||
//       (item?.Sale_Price &&
//         item.Sale_Price.toString().toLowerCase().startsWith(lowerSearch)) ||
//       (item?.Item_HSN &&
//         item.Item_HSN.toString().toLowerCase().startsWith(lowerSearch)) ||
//       (item?.Item_Category &&
//         item.Item_Category.toLowerCase().startsWith(lowerSearch))
//     );
//   });
// }, [items, searchTerm]);


 useEffect(() => {
    if (items && items?.items?.length > 0) {
      setSelectedItems(items?.items[0]);
    }
  }, [items]);

  console.log("items", items,items?.items);
//   console.log("Filtered Items:", filteredItems);
    return (
        <>
     
            <div className="sb2-2-2">
                <ul >
                    <li>
                 
                             <NavLink style={{display:"flex",flexDirection:"row"}}
                                                                to="/home"
                                                    
                                                              >
                                                                <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                                                                {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
                                                                Dashboard
                                                              </NavLink>
                    </li>

                </ul>
            </div>
            <div className="sb2-2-3 ">
                <div className="row">
                    <div className="col-md-12">
                        <div className="box-inn-sp">
      
 <div className="inn-title">
  <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:items-center">
   
    <div className="flex flex-row justify-between items-center mb-4 sm:mb-4">
      <div>
        <h4 className="text-2xl font-bold mb-1">All Items</h4>
        <p className="text-gray-500 text-sm sm:text-base">
          All Item Details
        </p>
      </div>

   
      <button
        style={{
          outline: "none",
          boxShadow: "none",
          backgroundColor: "#4CA1AF",
        }}
        className="text-white px-4 py-2 rounded-md sm:hidden"
         
      >
        Add Item
      </button>
    </div>

   
    <div
      className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:items-center
         sm:justify-between
      "
    >
  
      <div className="flex flex-col">
        <span className="text-sm text-gray-600 font-medium mb-1">From Date</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded-md shadow-sm text-gray-700 sm:w-auto"
          title="Search from date"
        />
      </div>

    
      <div className="flex flex-col">
        <span className="text-sm text-gray-600 font-medium mb-1">To Date</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded-md shadow-sm text-gray-700 sm:w-auto"
          title="Search to date"
        />
      </div>

    
     <div className="flex items-center w-full sm:w-56">
         <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-56"
        />
      </div> 

     
       <div className="hidden sm:block">
           <button
        style={{
          outline: "none",
          boxShadow: "none",
          backgroundColor: "#4CA1AF",
        }}
        className="hidden sm:block text-white px-4 py-2 rounded-md sm:w-auto"
          onClick={() => navigate("/items/add")}
      >
        Add Item
      </button> 
           </div>
    </div>
  </div>
</div>

                            <div className="tab-inn">

                                {isLoading ? (
                                    <p className="text-center mt-4">Fetching items...</p>
                                ) : items?.length === 0 ? (
                                    <p className="text-center mt-4">No items found.</p>
                                ) : (
                                    <div className="grid grid-cols-[30%_70%] gap-4">
                                        {/* Left side (Party List) */}
                                        <div className="p-2 border-r border-gray-300 overflow-x-auto ">
                                            <table className="w-full ">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left">Sl.No</th>
                                                        <th className="text-left">Item Name</th>
                                                        <th className="text-left">Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items &&
                                                        items?.items?.length > 0 &&
                                                        items?.items?.map((item,idx) => (
                                                            <tr
                                                                key={item.Item_Id}
                                                                className={
                                                                    selectedItem?.Item_Id === item.Item_Id
                                                                    ? "bg-[#f3f2fd] text-[#4CA1AF]"
                                                                        // ? "bg-[#f3f2fd]  text-[#7346ff]"
                                                                        : ""
                                                                }
                                                            >
                                                                <td>
                                                                    {(items?.currentPage - 1) * 10 + (idx + 1)}.
                                                                </td>
                                                                <td
                                                                    onClick={() => handleItemClick(item.Item_Id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {item?.Item_Name}
                                                                </td>
                                                                <td className={item?.Stock_Quantity <= 0 ? "text-red-500" : "text-green-500"}>
                                                                    {item?.Stock_Quantity}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Right side (Party Details) */}
                                        <div className="p-2 overflow-x-auto mt-2 justify-center items-center">
                                            {selectedItem && items?.items?.length>0 ? (
                                                <table className="w-full min-w-[500px]">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left ">Added at </th>
                                                            <th className="text-left ">Purchase Price </th>
                                                            <th className="text-left ">Sale Price </th>
                                                            <th className="text-left">Item HSN</th>
                                                            <th className="text-left">Item Category</th>
                                                            {/* <th className="text-left">Edit</th> */}

                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                         <td>
                                                                {selectedItem?.created_at
                                                                    ? new Date(selectedItem?.created_at).toLocaleDateString("en-IN", {
                                                                        day: "numeric",
                                                                        month: "numeric",
                                                                        year: "numeric",
                                                                    })
                                                                    : "N/A"}
                                                            </td>
                                                            <td>{selectedItem?.Purchase_Price || "N/A"}</td>
                                                            <td>{selectedItem?.Sale_Price || "N/A"}</td>
                                                            <td>{selectedItem?.Item_HSN || "N/A"}</td>
                                                            <td>{selectedItem?.Item_Category || "N/A"}</td>
{/* 
                                                            <td style={{
                                                                cursor: "pointer"

                                                            }}>
                                                                <i
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        color: "#7346ff"
                                                                    }}
                                                                    className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                            </td> */}

                                                        </tr>
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-gray-500 ">
                                                    No item selected or select an item to view details
                                                </p>
                                            )}
                                        </div>
                                    </div>



                                )}


                            </div>
                             <div className="flex justify-center align-center space-x-2 p-4">
                            <button type="button"
                                onClick={() => handlePreviousPage()}
                                disabled={page === 1}
                                className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === 1 ? 'opacity-50 ' : ''}
                `}
                            >
                                ← Previous
                            </button>
                            {[...Array(items?.totalPages).keys()].map((index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    // className={
                                    //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
                                    //         'bg-gray-200 hover:bg-gray-300'
                                    //     }`}
                                        className={
                                        `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#4CA1AF] text-white' : 
                                            'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button type="button"
                                onClick={() => handleNextPage()}
                                disabled={page === items?.totalPages || items?.totalPages === 0}
                                className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === items?.totalPages || items?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                            >
                                Next →
                            </button>
                        </div>
                        </div>
                      
                    </div>
                </div>
            </div>
        </>


    )
}