import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetSingleSaleQuery, usePrintSaleBillMutation } from "../../redux/api/saleApi";
import { LayoutDashboard } from "lucide-react";

export default function SaleView() {

    const location=useLocation();
    
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
    const { id: Sale_Id } = useParams();
    
    const navigate = useNavigate();

    const { data: sale} = useGetSingleSaleQuery(Sale_Id, {
        skip: Sale_Id === undefined,
    });
    console.log(sale,location);

    const[printSaleBill,{isLoading:isPrintLoading}]=usePrintSaleBillMutation();
 const handlePrint = async () => {
  try {
    console.log("🖨️ Print clicked");
    const pdfBlob = await printSaleBill(sale).unwrap(); // now returns Blob

    if (!pdfBlob) throw new Error("Failed to generate PDF");

    // Create a URL for the PDF blob
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    // Open PDF in new tab
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) newWindow.focus();
    else alert("Please allow pop-ups for printing.");

  } catch (err) {
    console.error("❌ Error during print process:", err);
    alert("Could not generate the print document.");
  }
};

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
                            <div className="flex justify-between">
                                <div style={{ marginTop: "15px" }} className=" inn-title  ">
                                    <h4 className="text-2xl font-bold mb-2">View Sale</h4>
                                    <p className="text-gray-500 mb-6">View Sale Details</p>
                                </div>
                            </div>
                            <div style={{padding:"0"}} className="tab-inn">
                                <div className="row">
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Party
                                        </span>
                                        <input type="text" value={sale?.invoicePartyDetails?.Party_Name ?? ""}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">
                                            GSTIN
                                        </span>
                                        <input type="text" 
                                        value={sale?.invoicePartyDetails?.GSTIN ?? ""}
                                            className="validate" readOnly />


                                    </div>
                                </div>
                                <div className="row">
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Invoice Number
                                        </span>
                                        <input type="text" value={sale?.invoicePartyDetails?.Invoice_Number??""}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">
                                            Invoice Date
                                        </span>
                                        <input type="text"
                                            value={new Date(sale?.invoicePartyDetails?.Invoice_Date).toLocaleDateString({
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
                                        <input type="text" value={sale?.invoicePartyDetails?.State_Of_Supply??""}
                                            className="validate" readOnly />


                                    </div>
                                    <div className="input-field col s6">
                                        <span className="active">Payment Type</span>
                                        <input type="text" value={sale?.invoicePartyDetails?.Payment_Type??""}
                                            className="validate" readOnly />


                                    </div>
                                </div>
                                <div className="row w-1/2 mt-2">
                                    <div className="input-field col s6">

                                        <span className="active">
                                            Reference Number

                                        </span>
                                        <input type="text" value={sale?.invoicePartyDetails?.Reference_Number ?? "N/A"}
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
                                            {sale?.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item?.Item_Category}</td>
                                                    <td>{item?.Item_Name}</td>
                                                    <td>{item?.Item_HSN}</td>
                                                    <td>{item?.Quantity}</td>
                                                    <td>{item?.Item_Unit}</td>
                                                    <td>{item?.Sale_Price}</td>
                                                    <td>{
                                                         item?.Discount_Type_On_Sale_Price === "Percentage" ? `${item?.Discount_On_Sale_Price==0.00?0:item?.Discount_On_Sale_Price}%` : `₹${item?.Discount_On_Sale_Price}`
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
                value={sale?.invoicePartyDetails?.Total_Amount ?? 0.00}
                readOnly
            />
        </div>
        
        {/* Total Received Field */}
        <div className="flex justify-between items-center">
            <label className="font-medium">Total Received</label>
            <input
                style={{ backgroundColor: "transparent" }}
                type="text"
                className="input-field border-b border-gray-300 w-1/2 p-1"
                value={sale?.invoicePartyDetails?.Total_Received ?? 0.00}
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
                value={sale?.invoicePartyDetails?.Balance_Due ?? 0.00}
                readOnly
            />
        </div>
        
    </div>
</div>
 <div className="flex justify-end gap-4 mt-4">
  <button
  type="button"
  onClick={() => {
    if (location.pathname.startsWith("/sale/view/SAL")) {
      navigate("/sale/all-sales");
    } else if (location.pathname.startsWith("/sale/view/SALS")) {
      navigate("/sale/all-new-sales");
    }
  }}
  className="text-white font-bold py-2 px-4 rounded"
  style={{ backgroundColor: "#4CA1AF" }}
>
  Cancel
</button>
                   <button
                    type="button"
                    disabled={isPrintLoading}
                    onClick={()=>handlePrint()}
                  
                    className=" text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                   {isPrintLoading ? "Printing..." : "Print"}
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