import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useGetSinglePurchaseQuery } from "../../redux/api/purchaseApi";
import { LayoutDashboard } from "lucide-react";

export default function PurchaseView() {
     const navigate = useNavigate();
   const TAX_TYPES = {
        "GST0": "GST 0%",
        "GST0.25": "GST 0.25%",
        "GST3": "GST 3%",
        GST5: "GST 5%",
        GST12: "GST 12%",
        GST18: "GST 18%",
        GST28: "GST 28%",
        GST40: "GST 40%",
        "IGST0": "IGST 0%",
        "IGST0.25": "IGST 0.25%",
        "IGST3": "IGST 3%",
        IGST5: "IGST 5%",
        IGST12: "IGST 12%",
        IGST18: "IGST 18%",
        IGST28: "IGST 28%",
        IGST40: "IGST 40%"
    }
        const {id:Purchase_Id} = useParams()
    const {data:purchase} = useGetSinglePurchaseQuery(Purchase_Id)
    console.log(purchase);
   
    //  return (
    //       <>
    //           <div className="sb2-2-2">
    //                   <ul>
    //                       <li>
    //                           <NavLink to="/home">
    //                               <i className="fa fa-home mr-2" aria-hidden="true"></i>
    //                               Dashboard
    //                           </NavLink>
    //                       </li>
  
    //                   </ul>
    //               </div>
  
    //               {/* Main Content */}
    //               <div className="sb2-2-3">
    //                   <div className="row">
    //                       <div className="col-md-12">
    //                           <div style={{padding: "20px"}}
    //                           className="box-inn-sp">
    //                                <div className="flex justify-between">
    //                               <div style={{marginTop: "15px"}} className=" inn-title   ">
                                        
    //                                       <h4 className="text-2xl font-bold mb-2">View  Purchase</h4>
    //                                       <p className="text-gray-500 mb-6">
    //                                         View Purchase Details
    //                                       </p>
                                      
    //                                    </div>
    //                                      <div className="inn-title">
    //                                           <button
    //                                               style={{
    //                                                   outline: "none",
    //                                                   boxShadow: "none",
    //                                                   backgroundColor: "#7346ff",
    //                                               }}
    //                                               className=" text-white px-4 py-2 rounded-md"
    //                                               onClick={() => navigate("/purchase/all-purchases")}
    //                                           >All Purchases</button>
    //                                       </div>
    //                                       </div>
                                  
                                  
  
    //                           </div>
    //                       </div>
    //                   </div>
    //               </div>
    //       </>
    //   );
return (
        <>
            <div className="sb2-2-2">
                <ul>

                    <NavLink style={{ display: "flex", flexDirection: "row" }}
                        to="/home"

                    >
                        <LayoutDashboard size={20} style={{ marginRight: '8px' }} />

                        Dashboard
                    </NavLink>

                </ul>
            </div>
            <div className="sb2-2-3">
                <div className="row" style={{margin: "0px"}}>
                    <div className="col-md-12">
                        <div style={{ padding: "20px" }}
                            className="box-inn-sp">
                            
                                <div style={{ marginTop: "15px" }} className=" inn-title  ">
                                    <h4 className="text-2xl font-bold mb-2">View Purchase</h4>
                                    <p className="text-gray-500 mb-6">View Purchase Details</p>
                                </div>
                           
                            <div style={{padding:"0"}} className="tab-inn">
                                <div className="row">
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Party
                                        </span>
                                        <input type="text" value={purchase?.billPurchaseDetails?.Party_Name ?? ""}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">
                                            GSTIN
                                        </span>
                                        <input type="text" value={purchase?.billPurchaseDetails?.GSTIN ?? ""}
                                            className="validate" readOnly />


                                    </div>
                                </div>
                                <div className="row">
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Bill Number
                                        </span>
                                        <input type="text" 
                                        value={purchase?.billPurchaseDetails?.Bill_Number ?? "N/A"}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Invoice Date
                                        </span>
                                        <input type="text"
                                            value={
                                                new Date(purchase
                                                    ?.billPurchaseDetails?.Bill_Date).toLocaleDateString({
                                                day: "numeric",
                                                month: "numeric",
                                                year: "numeric",
                                            })}
                                            className="validate" readOnly />


                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-field col s6">
                                        <span className="active ">
                                            State of Supply
                                        </span>
                                        <input type="text" 
                                        value={purchase?.billPurchaseDetails?.State_Of_Supply ?? "N/A"}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">Payment Type</span>
                                        <input type="text" value={purchase?.billPurchaseDetails?.Payment_Type ?? "N/A"}
                                            className="validate" readOnly />


                                    </div>
                                </div>
                                <div className="row w-1/2 mt-2">
                                    <div className="input-field col s6">

                                        <span className="active">
                                            Reference Number

                                        </span>
                                        <input type="text" value={purchase?.billPurchaseDetails?.Reference_Number ?? "N/A"}
                                            className="validate" readOnly />
                                    </div>
                                </div>
                                <div className="table-responsive table-desi mt-4">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>

                                                <th>Sl.No</th>
                                                <th>Category</th>
                                                <th>Item</th>
                                                <th>Item_HSN</th>
                                                <th>Qty</th>
                                                <th>Unit</th>
                                                <th>Price/Unit</th>
                                                <th>Discount</th>
                                                <th>Tax</th>
                                                <th>Tax Amount</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchase?.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item?.Item_Category}</td>
                                                    <td>{item?.Item_Name}</td>
                                                    <td>{item?.Item_HSN}</td>
                                                    <td>{item?.Quantity}</td>
                                                    <td>{item?.Item_Unit}</td>
                                                    <td>{item?.Purchase_Price}</td>
                                                    <td>{
                                                         item?.Discount_Type_On_Purchase_Price === "Percentage" ?
                                                          `${item?.Discount_On_Purchase_Price==0.00?0:item?.Discount_On_Purchase_Price}%`:

                                                          `₹${item?.Discount_On_Purchase_Price}`
                                                    }</td>
                                                    {/* <td>{item?.Tax_Type}</td> */}
                                                    <td>{Object.keys(TAX_TYPES).includes(item?.Tax_Type) ? TAX_TYPES[item?.Tax_Type] : item?.Tax_Type
                                                    }</td>
                                                    <td>{item?.Tax_Amount}</td>
                                                    <td>{item?.Amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                              <div className="w-full"> {/* Container to ensure the totals span full available width */}
    
    {/* This inner div is what holds the totals and is pushed to the right */}
    <div className="flex flex-col space-y-2 w-full sm:w-1/2 md:w-1/3 ml-auto">
        
        {/* Total Amount Field */}
        <div className="flex justify-between items-center">
            <label className="font-medium">Total Amount</label>
            <input
                style={{ backgroundColor: "transparent" }}
                type="text"
                className="input-field border-b border-gray-300  w-1/2 p-1"
                value={purchase?.billPurchaseDetails?.Total_Amount ?? 0.00}
                readOnly
            />
        </div>
        
        {/* Total Received Field */}
        <div className="flex justify-between items-center">
            <label className="font-medium">Total Paid</label>
            <input
                style={{ backgroundColor: "transparent" }}
                type="text"
                className="input-field border-b border-gray-300 w-1/2 p-1"
                value={purchase?.billPurchaseDetails?.Total_Paid ?? 0.00}
                readOnly
            />
        </div>
        
        {/* Balance Due Field (Often styled differently) */}
        <div className="flex justify-between items-center ">
            <label className="font-bold text-lg">Balance Due</label>
            <input
                style={{ backgroundColor: "transparent" }}
                type="text"
                className="input-field  w-1/2 p-1 font-extrabold text-lg"
                value={purchase?.billPurchaseDetails?.Balance_Due ?? 0.00}
                readOnly
            />
        </div>
        
    </div>
</div>
 <div className="flex justify-end gap-4 mt-4">
   <button
                    type="button"
                
                    onClick={() => navigate("/purchase/all-purchases")}
                    className=" text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                    Cancel
                  </button>
                
                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}