
import {  useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAllPartiesQuery } from "../../redux/api/partyAPi";
import { itemApi,  useGetAllItemsQuery } from "../../redux/api/itemApi";
import { useRef } from "react";
import { useEffect } from "react";


import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { saleApi, useAddSaleMutation, useGetLatestInvoiceNumberQuery } from "../../redux/api/saleApi";
import { saleFormSchema } from "../../schema/saleFormSchema";

import PartyAddModal from "../../components/Modal/PartyAddModal";
import { LayoutDashboard } from "lucide-react";




export default function SaleAdd() {

  const dispatch=useDispatch();
 const TAX_RATES = {
  "GST0": 0,
  "GST0.25": 0.25,
  "GST3": 3,
  "GST5": 5,
  "GST12": 12,
  "GST18": 18,
  "GST28": 28,
  "GST40": 40,

  "IGST0": 0,
  "IGST0.25": 0.25,
  "IGST3": 3,
  "IGST5": 5,
  "IGST12": 12,
  "IGST18": 18,
  "IGST28": 28,
  "IGST40": 40,
};

const categoryRefs = useRef([]); // store refs for category dropdowns
const itemRefs = useRef([]);  



const navigate=useNavigate();
    const { data: parties} = useGetAllPartiesQuery();
       const { data: items} = useGetAllItemsQuery();
    console.log(items,parties);
      //const { data: categories, isLoading: isLoadingCategories } = useGetAllCategoriesQuery()
    const[open,setOpen] = useState(false);
    //const[categoryOpen,setCategoryOpen] = useState(false);
   //const [showModal, setShowModal] = useState(false);
    //const[selected,setSelected] = useState([]);
    const[partySearch,setPartySearch] = useState("");
    // const [newCategory, setNewCategory] = useState("");
     const[showPartyModal,setShowPartyModal] = useState(false);
const [confirmModal, setConfirmModal] = useState({
  open: false,
  item: null,
  rowIndex: null
});
 const{data:latestInvoiceNumber}=useGetLatestInvoiceNumberQuery();
 const [showGSTIN, setShowGSTIN] = useState("");
 console.log(latestInvoiceNumber,"latestInvoiceNumber");
 
 const itemUnits = {
    "gm": "Gram",
    "Kg": "Kilogram",
    "lt": "Litre",
    "pcs": "Piece",

  }
//     const [rows, setRows] = useState([
//   { itemSearch: "", itemOpen: false } // ✅ only UI state here
// ]);
useEffect(() => {
    setValue("Invoice_Number", latestInvoiceNumber?.newInvoiceNumber);
},[latestInvoiceNumber]);

const [rows, setRows] = useState([
  { itemSearch: "", itemOpen: false, isExistingItem: false, isHSNLocked: false, 
    isUnitLocked: false, CategoryOpen: false, categorySearch: "" }
]);

const[addSale,{isLoading:isAddingSale}]=useAddSaleMutation();
// helper to update a field in a specific row
const handleRowChange = (index, field, value) => {
  setRows((prev) => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    return updated;
  });
};
 useEffect(() => {
  const handleClickOutside = (event) => {
    setRows((prev) =>
      prev.map((row, idx) => {
        const catRef = categoryRefs.current[idx];
        const itemRef = itemRefs.current[idx];
     

        const clickedInsideCategory =
          catRef && catRef.contains(event.target);
        const clickedInsideItem =
          itemRef && itemRef.contains(event.target);

    

        // if clicked outside both → close
        if (!clickedInsideCategory && !clickedInsideItem) {
          return { ...row, CategoryOpen: false, itemOpen: false };
        }
  
        return row;
      })
    );
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);




    const {
      control,
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(saleFormSchema),
      defaultValues:{
        Party_Name: "",
      
        Invoice_Number: "",
        Invoice_Date: "",
        State_Of_Supply: "",
        Total_Amount: "",
        Balance_Due: "",
        Total_Received: "",
        Payment_Type: "Cash",
        Reference_Number: "",
        items:[{

        
          Item_Category: "",
          Item_Name: "",
           Quantity: 0,
          Item_Unit:"",
          Sale_Price: "",
        
          Discount_On_Sale_Price: "",
          Discount_Type_On_Sale_Price: "Percentage",
          Tax_Type: "None",
          Tax_Amount: "",
          Amount: "",
        }
        ]
      }
  
    })
      const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });




const handleAddRow = () => {
  setRows((prev) => [
    // only close CategoryOpen, preserve lock states
    ...prev.map((row) => ({
      ...row,
      CategoryOpen: false,
      itemOpen: false, // also close item dropdown if open
    })), 
    {
      itemSearch: "",
      itemOpen: false,
      CategoryOpen: false,
      isHSNLocked: false,
      isUnitLocked: false,
      isExistingItem: false,
      categorySearch: "",
    },
  ]);

  append({
    Item_Category: "",
    Item_Name: "",
    Item_HSN: "",
    Quantity: 0,
    Item_Unit: "",
    Sale_Price: "",
    Discount_On_Sale_Price: "",
    Discount_Type_On_Sale_Price: "Percentage",
    Tax_Type: "None",
    Tax_Amount: "",
    Amount: "",
  });
};

const handleDeleteRow = (i) => {
  setRows((prev) => prev.filter((_, idx) => idx !== i)); // remove UI state
  remove(i); // remove from form
};

const itemsValues = watch("items");   // watch all item rows
const totalReceived = watch("Total_Received"); // watch Total_Received
const num = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));

// helper to calculate amount in a specific row
const calculateRowAmount = (row, index, itemsValues) => {
  console.log(row,"row",index,"index",itemsValues,"itemsValues");
  const price = num(row.Sale_Price);
  const qty = row.Quantity || 0; // default 0
  const subtotal = price * qty;

  // discount
  let disc = num(row.Discount_On_Sale_Price);
  if ((row.Discount_Type_On_Sale_Price || "Percentage") === "Percentage") {
    disc = (subtotal * disc) / 100;
  }
  const afterDiscount = Math.max(0, subtotal - disc);

  // tax
  const taxPercent = TAX_RATES[row.Tax_Type] ?? 0;
  const taxAmount = (afterDiscount * taxPercent) / 100;

  const finalAmount = afterDiscount + taxAmount;

  // ✅ Recalculate total with current row updated
  let totalAmount = 0;
  itemsValues?.forEach((r, i) => {
    if (i === index) {
      // use updated values for current row
      totalAmount += parseFloat(finalAmount || 0);
    } else {
      totalAmount += parseFloat(r.Amount || 0);
    }
  });

  return {
    ...row,
    Quantity: Number(qty),
    Tax_Amount: taxAmount.toFixed(2),
    Amount: finalAmount.toFixed(2),
    Total_Amount: totalAmount.toFixed(2), // ✅ correct grand total
    Balance_Due: (totalAmount - num(totalReceived)).toFixed(2),
  };
};



// const calcAll = (data) => {
//   // ensure items exist & valid
//   const cleanedItems = (data.items || [])
//     .filter((it) => (it.Item_Name || "").trim() !== "")
//     .map(calculateRowAmount);

//   const totalAmount = cleanedItems.reduce(
//     (sum, it) => sum + num(it.Amount),
//     0
//   );

//   const totalReceived = num(data.Total_Received); // optional
//   const balanceDue = totalAmount - totalReceived;

//   return {
//     items: cleanedItems,
//     totals: {
//       Total_Amount: totalAmount.toFixed(2),
//       Total_Received: totalReceived.toFixed(2),
//       Balance_Due: balanceDue.toFixed(2),
//     },
//   };
// };


//const itemsValues = watch("items"); // watch all rows
 const formValues = watch();




const onSubmit = async(data) => {
  console.log("Form Data (from RHF):", data);

//   const { items, totals } = calcAll(data);

//   // 2) build payload
//   const payload = {
//     ...data,
//     items,
//     Total_Amount: totals.Total_Amount,
//     Total_Received: totals.Total_Received,           // blank -> 0.00
//     Balance_Due: totals.Balance_Due,
//   };
//  const seenItems = new Set();
//    const itemQuantities = {};
 
//    for (const item of payload.items) {
//      const name = item.Item_Name?.trim().toLowerCase();
//      const category = item.Item_Category?.trim().toLowerCase();
//      const itemHSN=item.Item_HSN?.trim().toLowerCase();
//      const Quantity=item.Quantity
     
//      if (!name || !category || !itemHSN || !Quantity) {
//        toast.error("Each item must have a valid name, category, HSN and quantity.");
//        return;
//      }
 
//      // ❌ Prevent duplicates
//      if (seenItems.has(name)) {
//        toast.error(
//          `Duplicate item '${item.Item_Name}' found. Please ensure each item appears only once.`
//        );
//        return;
//      }
//      seenItems.add(name);
 
//      // ✅ Aggregate quantity
//      itemQuantities[name] = (itemQuantities[name] || 0) + Number(item.Quantity || 0);
//    }
 
//    // 5️⃣ Stock & Existence validation (STRICT)
//    for (const item of payload.items) {
//      const dbItem = items.find(
//        (it) => it.Item_Name.trim().toLowerCase() === item.Item_Name.trim().toLowerCase()
//      );
 
//      // ❌ No new items allowed during sale
//      if (!dbItem) {
//        toast.error(
//          `Item '${item.Item_Name}' does not exist in inventory. Please add it in items  first before selling.`
//        );
//        return;
//      }
 
    
     
//    }
  if (!data.items || data.items.length === 0) {
    toast.error("Please add at least one item before saving the sale.");
    return;
  }

  // ✅ Clean up items (optional safety — remove blank rows)
  const cleanedItems = data.items.filter(
    (it) => it.Item_Name && it.Item_Name.trim() !== ""
  );

  if (cleanedItems.length === 0) {
    toast.error("Please add at least one valid item with a name.");
    return;
  }

  // ✅ Validate no duplicates
  const seenItems = new Set();
  for (const item of cleanedItems) {
    const name = item.Item_Name?.trim().toLowerCase();

    if (seenItems.has(name)) {
      toast.error(`Duplicate item '${item.Item_Name}' found.`);
      return;
    }
    seenItems.add(name);
  }

  // ✅ Ensure all items have tax & amount values (since auto-calculated)
  const itemsWithDefaults = cleanedItems.map((item) => ({
    ...item,
    Tax_Type: item.Tax_Type || "None",
    Tax_Amount: item.Tax_Amount || "0.00",
    Amount: item.Amount || "0.00",
  }));

  // ✅ Build final payload
  const payload = {
    ...data,
    items: itemsWithDefaults,
    Total_Amount: data.Total_Amount || 0,
    Total_Received: data.Total_Received || 0,
    Balance_Due:
      data.Balance_Due ||
      ((data.Total_Amount || 0) - (data.Total_Received || 0)),
  };

  console.log("📦 Final Payload Sent:", payload);

  try{
    const res = await addSale({
      body: payload,
    }).unwrap();
    console.log(" successfully:", res);
    const resData = res?.data || res;
    dispatch(itemApi.util.invalidateTags(["Item"]));
    dispatch(saleApi.util.invalidateTags(["Sale"]));
    if(!resData?.success){
      toast.error("Failed to add new sale");
      return;
    }else{
      toast.success("New Sale added successfully!");
     navigate("/sale/all-sales");
    } 

  }catch(error){
    const errorMessage =
      error?.data?.message || error?.message || "Failed to add new lead";
    toast.error(errorMessage);
    // toast.error("Failed to add lead");
    console.error("Submission failed", error);
  }
}


    useEffect(() => {
  const gstin = parties?.parties?.find(
    (party) => party.Party_Name === watch("Party_Name")
  )?.GSTIN;

  setShowGSTIN(gstin || ""); // ✅ never undefined
}, [watch("Party_Name"), parties]);


const handleItemSelect = (it, i) => {
  console.log("Selected Item:", it, "at row", i);
  setRows((prev) => {
    const updated = [...prev];
    updated[i] = {
      ...updated[i],
      Item_Category: it.Item_Category || "",
      Item_HSN: it.Item_HSN || "",
      categorySearch: it.Item_Category || "",
      isExistingItem: true,
      isHSNLocked: true,
      isUnitLocked: true,
    };
    return updated;
  });

  handleRowChange(i, "itemSearch", it.Item_Name);
  handleRowChange(i, "isExistingItem", true);
  handleRowChange(i, "CategoryOpen", false);

  setValue(`items.${i}.Item_Category`, it.Item_Category, { shouldValidate: true });
  setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });
  setValue(`items.${i}.Item_HSN`, it.Item_HSN, { shouldValidate: true });
  setValue(`items.${i}.Sale_Price`, it.Sale_Price || 0.0, { shouldValidate: true });
  setValue(`items.${i}.Item_Unit`, it.Item_Unit, { shouldValidate: true });
  setValue(`items.${i}.Tax_Type`, it.Tax_Type, { shouldValidate: true });
  handleRowChange(i, "itemOpen", false);

  const { Tax_Amount, Amount, Total_Amount, Balance_Due } = calculateRowAmount(
    {
      ...itemsValues[i],
      Item_Name: it.Item_Name,
      Sale_Price: it.Sale_Price || 0,
      Quantity: itemsValues[i]?.Quantity || 0,
      Discount_On_Sale_Price: itemsValues[i]?.Discount_On_Sale_Price || 0,
      Discount_Type_On_Sale_Price: itemsValues[i]?.Discount_Type_On_Sale_Price,
      Tax_Type: itemsValues[i]?.Tax_Type,
    },
    i,
    itemsValues
  );

  setValue(`items.${i}.Tax_Amount`, Tax_Amount);
  setValue(`items.${i}.Amount`, Amount);
  setValue(`Total_Amount`, Total_Amount);
  setValue(`Balance_Due`, Balance_Due);
};

  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);
  const paymentType = watch("Payment_Type", "");
console.log(itemsValues,"itemsValues");
    return (
        <>
            <div className="sb2-2-2">
                    <ul>
                        {/* <li>
                            <NavLink to="/home">
                                <i className="fa fa-home mr-2" aria-hidden="true"></i>
                                Dashboard
                            </NavLink>
                        </li> */}
                             <NavLink style={{display:"flex",flexDirection:"row"}}
                                                                to="/home"
                                                    
                                                              >
                                                                <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                                                                {/* <i className="fa fa-home mr-2" aria-hidden="true"></i> */}
                                                                Dashboard
                                                              </NavLink>

                    </ul>
                </div>

                {/* Main Content */}
                <div className="sb2-2-3">
                    <div className="row" style={{margin: "0px"}}>
                        <div className="col-md-12">
                            <div style={{padding: "20px"}}
                            className="box-inn-sp">
                                  <div className="inn-title">
                                 <div className="flex justify-between">
                               
                                      <div>
                                        <h4 className="text-2xl font-bold mb-2">Add New Sale</h4>
                                        <p className="text-gray-500 mb-6">
                                            Add new sale details
                                        </p>
                                    </div>
                                
                                      <div>
                                            <button
                                                style={{
                                                    outline: "none",
                                                    boxShadow: "none",
                                                    backgroundColor: "#4CA1AF"
                                                    // backgroundColor: "#7346ff",
                                                }}
                                                className=" text-white px-4 py-2 rounded-md"
                                                onClick={() => navigate("/sale/all-sales")}
                                            >All Sales</button>
                                            </div>
                                        </div>
                                        </div>
                                    <div style={{padding:"0"}} className="tab-inn">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                     <div className="row">
 {/* <div className="input-field col s6 mt-4 relative">
                                            <span className="active">
                                                Party
                                                <span className="text-red-500">*</span>
                                            </span>

                                          

                                            <input
                                                type="text"
                                                id="Party_Name"
                                                value={partySearch}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setPartySearch(value);
                                                    setValue("Party_Name", value);
                                                    setOpen(true);
                                                }}
                                                onClick={() => setOpen((prev) => !prev)}
                                                onBlur={() => {
                                                    // ✅ Check if typed value exists in the party list
                                                    const exists = parties?.parties?.some(
                                                        (party) =>
                                                            party?.Party_Name?.toLowerCase() === partySearch.toLowerCase()
                                                            || party?.Phone_Number?.startsWith(partySearch)
                                                    );

                                                    // If not found and not added via modal → clear input
                                                    if (!exists) {
                                                        setPartySearch("");
                                                        setValue("Party_Name", "");
                                                    }

                                                    // Close dropdown after short delay (so click events register)
                                                    setTimeout(() => setOpen(false), 150);
                                                }}
                                                placeholder="Party Name"
                                                className="w-full outline-none border-b-2 text-gray-900"
                                            />

                                           
                                            {open && (
                                                <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    <span
                                                        onClick={() => {
                                                            setShowPartyModal(true);

                                                        }}
                                                        className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        + Add Party
                                                    </span>
                                                    {parties?.parties
                                                        ?.filter((party) =>
                                                            party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase())
                                                            || party?.Phone_Number?.startsWith(partySearch)
                                                        )
                                                        .map((party, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => {
                                                                    setPartySearch(party.Party_Name); // show selected
                                                                    setValue("Party_Name", party.Party_Name); // update RHF
                                                                    setOpen(false);
                                                                }}
                                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            >
                                                                {party.Party_Name}({party.Phone_Number})
                                                            </div>
                                                        ))}

                                                   
                                                    {parties?.parties?.filter((party) =>
                                                        party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase())
                                                    ).length === 0 && (
                                                            <p className="px-3 py-2 text-gray-500">No Party found</p>
                                                        )}
                                                </div>
                                            )}
                                            {showPartyModal && (
                                                <PartyAddModal
                                                    onClose={() => setShowPartyModal(false)}
                                                    onSave={(newParty) => {
                                                        // Add new party to the list if needed
                                                        setPartySearch(newParty);
                                                        setValue("Party_Name", newParty);
                                                        setShowPartyModal(false);
                                                    }}
                                                />
                                            )}
                                           
                                            {errors?.Party_Name && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors?.Party_Name?.message}
                                                </p>
                                            )}
                                        </div> */}
                                                                                <div className="input-field col s6 mt-4 relative">
                                          <span className="active">
                                            Party
                                            <span className="text-red-500">*</span>
                                          </span>
                                        
                                          <input
                                            type="text"
                                            id="Party_Name"
                                            value={partySearch}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              setPartySearch(value);
                                              setValue("Party_Name", value, { shouldValidate: true });
                                              setOpen(true);
                                            }}
                                            onClick={() => setOpen((prev) => !prev)}
                                            onBlur={() => {
                                              const typedValue = partySearch.trim().toLowerCase();
                                        
                                              // ✅ Full match only (not partial)
                                              const matchedParty = parties?.parties?.find(
                                                (party) => party.Party_Name.toLowerCase() === typedValue
                                              );
                                        
                                              if (matchedParty) {
                                                // ✅ Set full party info
                                                setPartySearch(matchedParty.Party_Name);
                                                setValue("Party_Name", matchedParty.Party_Name, { shouldValidate: true, shouldDirty: true });
                                        
                                                // ✅ Check GSTIN (must be present)
                                                if (!matchedParty.GSTIN || matchedParty.GSTIN.trim() === "") {
                                               
                                                  setValue("GSTIN", "", { shouldValidate: true });
                                                } else {
                                                  setValue("GSTIN", matchedParty.GSTIN, { shouldValidate: true, shouldDirty: true });
                                                }
                                        
                                               
                                              } else {
                                                // ❌ Not an exact match → clear field
                                                setPartySearch("");
                                                setValue("Party_Name", "");
                                              }
                                        
                                              setTimeout(() => setOpen(false), 150);
                                            }}
                                            placeholder="Party Name"
                                            className="w-full outline-none border-b-2 text-gray-900"
                                          />
                                        
                                          {/* Dropdown */}
                                          {open && (
                                            <div className="absolute z-20 flex flex-col mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                              <span
                                                onClick={() => setShowPartyModal(true)}
                                                className="block px-3 py-2 text-[#4CA1AF] font-medium hover:bg-gray-100 cursor-pointer"
                                              >
                                                + Add Party
                                              </span>
                                        
                                              {parties?.parties
                                                ?.filter(
                                                  (party) =>
                                                    party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase()) ||
                                                    party?.Phone_Number?.includes(partySearch)
                                                )
                                                .map((party, i) => (
                                                  <div
                                                    key={i}
                                                    onClick={() => {
                                                      // Select from dropdown
                                                      setPartySearch(party.Party_Name);
                                                      setValue("Party_Name", party.Party_Name, { shouldValidate: true, shouldDirty: true });
                                        
                                                      // ✅ GSTIN validation on selection
                                                      if (!party.GSTIN || party.GSTIN.trim() === "") {
                                                        
                                                        setValue("GSTIN", "", { shouldValidate: true });
                                                      } else {
                                                        setValue("GSTIN", party.GSTIN, { shouldValidate: true, shouldDirty: true });
                                                      }
                                        
                                                     
                                                      setOpen(false);
                                                    }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                  >
                                                    {party.Party_Name} ({party.Phone_Number})
                                                  </div>
                                                ))}
                                        
                                              {/* No match */}
                                              {parties?.parties?.filter((party) =>
                                                party?.Party_Name?.toLowerCase().includes(partySearch.toLowerCase())
                                              ).length === 0 && (
                                                <p className="px-3 py-2 text-gray-500">No Party found</p>
                                              )}
                                            </div>
                                          )}
                                        
                                          {/* Add Party Modal */}
                                          {showPartyModal && (
                                            <PartyAddModal
                                              onClose={() => setShowPartyModal(false)}
                                              onSave={(newParty) => {
                                                setPartySearch(newParty);
                                                setValue("Party_Name", newParty, { shouldValidate: true });
                                                setShowPartyModal(false);
                                              }}
                                            />
                                          )}
                                        
                                          {/* RHF Error */}
                                          {errors?.Party_Name && (
                                            <p className="text-red-500 text-xs mt-1">{errors?.Party_Name?.message}</p>
                                          )}
                                        </div>
                <div className="input-field col s6 mt-4">
                    <span className="active">
                    GSTIN
              
                    </span>
                    
                    <input
                      type="text"
                      id=" GSTIN"
                value={showGSTIN || ""}
                      placeholder="GSTIN"
                      className="w-full outline-none border-b-2 text-gray-900"
                      readOnly
                    />
                  
                  </div>

                                    </div>
                                    <div className="row  ">
                                     
      {/* Invoice Number */}
                                                            <div className="input-field col s6 mt-4">
                    <span className="active">
                    Invoice Number
                    <span className="text-red-500">*</span>
                    </span>
                    
                    <input
                      type="text"
                      id=" Invoice_Number"
                      {...register("Invoice_Number")}
                      placeholder=" Invoice_Number"
                      
                      className="w-full outline-none border-b-2 text-gray-900"
                      readOnly
                    />
                    {errors?. Invoice_Number && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?. Invoice_Number?.message}
                      </p>
                    )}
                  </div>
                                  
                                      

                                        {/* Invoice Date */}
                                        <div className="input-field col s6 mt-4">
                                            <span className="active">
                                                Invoice Date
                                                  <span className="text-red-500">*</span>
                                            </span>
                                            
                    <input
                      type="date"
                      id=" Invoice_Date"
                      {...register("Invoice_Date")}
                      placeholder=" Invoice_Date"
                      className="w-full outline-none border-b-2 text-gray-900"
                          min={
      latestInvoiceNumber?.latestInvoiceInfo?.createdAt
        ? new Date(latestInvoiceNumber?.latestInvoiceInfo?.createdAt).toISOString().split("T")[0]
        : ""
    } // ✅ Prevent earlier dates
                    />
                    {errors?.Invoice_Date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?. Invoice_Date?.message}
                      </p>
                    )}
                                        </div>

                                      
                                    </div>

                                       <div className="row">
                                        
                                        {/* State of Supply */}
                                        <div className="input-field col s6">
                                            <span className="active mb-4">
                                                State of Supply
                                                  <span className="text-red-500">*</span>
                                            </span>
                                            <select
                                                id="stateOfSupply"
                                                className="validate mt-2"
                                                {...register("State_Of_Supply")}
                                            >
                                                <option value="">Select State</option>
                                                <option value="West Bengal">West Bengal</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Delhi">Delhi</option>
                                            </select>
                                              {errors?.State_Of_Supply && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.State_Of_Supply?.message}
                                            </p>
                                        )}
                                        </div>
                                     <div className="input-field col s6  mt-4">
                  <span className="active">Payment Type</span>
                 
                    <select id="Payment_Type" {...register("Payment_Type")}
                     >
                      <option value="">Select Payment Type</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Neft">Neft</option>
                    </select>
                    {errors?.Payment_Type && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Payment_Type?.message}
                      </p>
                    )}
                  </div>
                                         
                                    </div>

                                    {/* <div className="row w-1/2 mt-2">
                                                     <div className="input-field col s6 mt-4">
                   <span className="active">
                      Reference Number
                      
                    </span>
                    <input
                    style={{ marginBottom: "0px" }}
                      type="text"
                      id=" Reference_Number"
                      {...register("Reference_Number")}
                      placeholder="Reference_Number"
                      className="w-full outline-none border-b-2 text-gray-900"
                    />
                    {errors?.Reference_Number && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors?.Reference_Number?.message}
                      </p>
                    )}
                  </div>
                  </div> */}
                                             {(paymentType === "Cheque" || paymentType === "Neft") && (
        <div className="row w-1/2 mt-2 mb-4">
          <div className="input-field col s6 mt-4">
            <span className="active">
              {paymentType === "Cheque" ? "Cheque Number" : "NEFT Reference Number"}
            </span>

            <input
              type="text"
              id="Reference_Number"
            {...register("Reference_Number")}
              placeholder={`Enter ${paymentType} number`}
              className="w-full outline-none border-b-2 text-gray-900"
            />

            {errors?.Reference_Number && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.Reference_Number?.message}
              </p>
            )}
          </div>
        </div>
      )}
                

                               
                               



                               
                                    
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
  <tbody style={{maxHeight: "10rem", overflowY: "scroll"}}>
  {fields.map((field, i) => (
    <tr key={field.id}>
      {/* Action + Serial Number */}
      <td style={{ padding: "0px" ,textAlign: "center", verticalAlign: "middle" }}>
        <div
          className="flex align-center justify-center text-center gap-2"
          style={{ whiteSpace: "nowrap" }}
        >
          <button
            type="button"
            onClick={() => handleDeleteRow(i)}
            style={{
              background: "transparent",
              border: "none",
              color: "red",
              cursor: "pointer",
            }}
          >
            🗑
          </button>
          <span>{i + 1}</span>
        </div>
      </td>

<td
  style={{  padding: "0px" ,position:"relative" }}>
  
  <div ref={(el) => (categoryRefs.current[i] = el)}>



<input
  type="text"
  value={rows[i]?.categorySearch || watch(`items.${i}.Item_Category`) || ""}
  style={{ marginBottom: "0px" }}
  readOnly
  // onClick={() => {
  //   if (!rows[i]?.isExistingItem) {
  //     setRows((prev) =>
  //       prev.map((row, idx) => ({
  //         ...row,
  //         CategoryOpen: idx === i ? !row.CategoryOpen : false,
  //       }))
  //     );
  //   }
  // }}
  // onChange={(e) => {
  //   const value = e.target.value;
  //   handleRowChange(i, "categorySearch", value);
  //   setValue(`items.${i}.Item_Category`, value);

  //   // ✅ If user clears or types new item → unlock
  //   if (!rows[i]?.isExistingItem) {
  //     handleRowChange(i, "isExistingItem", false);
  //   }
  // }}
  //   onBlur={() => {
  //   const typedValue = rows[i]?.categorySearch || "";
  //   const exists = categories?.some(
  //     (cat) =>
  //       cat.Item_Category.toLowerCase() === typedValue.toLowerCase()
  //   );

  //   if (!exists) {
  //     // reset if category doesn't exist
  //     handleRowChange(i, "categorySearch", "");
  //     setValue(`items.${i}.Item_Category`, "");
  //   }
  // }}
  placeholder="Category"
  className="w-full outline-none border-b-2 text-gray-900"
  // readOnly={rows[i]?.isExistingItem} // 🔒 lock if item exists
/>

    {errors?.items?.[i]?.Item_Category && (
          <p className="text-red-500 text-xs mt-1">
            {errors.items[i].Item_Category.message}
          </p>
        )}


</div>
  
</td>

      {/* Item Dropdown */}
      <td style={{ padding: "0px",width: "15%", position: "relative" }}>
         <div ref={(el) => (itemRefs.current[i] = el)}> {/* ✅ attach ref */}
  <input
  type="text"
  value={rows[i]?.itemSearch || ""}
  onChange={(e) => {
    const typedValue = e.target.value;
    handleRowChange(i, "itemSearch", typedValue);
    handleRowChange(i, "CategoryOpen", false);
    // setValue(`items.${i}.Item_Name`, typedValue);
handleRowChange(i, "isHSNLocked", false);
handleRowChange(i, "isExistingItem", false);
handleRowChange(i ,"isUnitLocked", false);
   
    const exists = items?.items?.find(
      (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
    );
      if (exists) {
      // ✅ Only store if it's a valid item
      setValue(`items.${i}.Item_Name`, typedValue, { shouldValidate: true });
      handleRowChange(i, "isExistingItem", true);
    } else {
      // ❌ Clear Item_Name in RHF to trigger error
      setValue(`items.${i}.Item_Name`, "", { shouldValidate: true });
      handleRowChange(i, "isExistingItem", false);
    }
    //handleRowChange(i, "isExistingItem", exists); // false if new item
  }}
  // onBlur={(e) => {
  //   const typedValue = e.target.value.trim();

  //   const exists = items?.items?.find(
  //     (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
  //   );

  //   if (exists) {
  //     setValue(`items.${i}.Item_Name`, typedValue, { shouldValidate: true });
  //     handleRowChange(i, "isExistingItem", true);
  //   } else {
  //     setValue(`items.${i}.Item_Name`, "", { shouldValidate: true });
  //     handleRowChange(i, "isExistingItem", false);
  //   }
  // }}
  onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
  placeholder="Item Name"
  className="w-full outline-none border-b-2 text-gray-900"
/>
{/* <input
  type="text"
  value={rows[i]?.itemSearch || ""}
  onChange={(e) => {
    const typedValue = e.target.value;

    // Always keep what user types for UI
    handleRowChange(i, "itemSearch", typedValue);
    handleRowChange(i, "CategoryOpen", false);

    // Don't clear immediately, only mark as "not existing"
    const exists = items?.items?.some(
      (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
    );
    handleRowChange(i, "isExistingItem", exists);
  }}
  onBlur={(e) => {
    const typedValue = e.target.value.trim();

    const exists = items?.items?.find(
      (it) => it.Item_Name.trim().toLowerCase() === typedValue.toLowerCase()
    );

    if (exists) {
      // ✅ Keep valid value
      setValue(`items.${i}.Item_Name`, exists.Item_Name, { shouldValidate: true });
      handleRowChange(i, "itemSearch", exists.Item_Name);
      handleRowChange(i, "isExistingItem", true);
    } else {
      // ❌ Clear invalid value only when leaving input
      setValue(`items.${i}.Item_Name`, "", { shouldValidate: true });
      handleRowChange(i, "itemSearch", ""); // clear UI as well
      handleRowChange(i, "isExistingItem", false);
    }
  }}
  onClick={() => handleRowChange(i, "itemOpen", !rows[i]?.itemOpen)}
  placeholder="Item Name"
  className="w-full outline-none border-b-2 text-gray-900"
/> */}

{errors?.items?.[i]?.Item_Name && (
  <p className="text-red-500 text-xs mt-1">
    {errors.items[i].Item_Name.message}
  </p>
)}


        {/* Dropdown List */}
{rows[i]?.itemOpen && (
  <div
    style={{ width: "40rem" }}
    className="absolute z-20  w-full bg-white border
      border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
  >
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-100 border-b">
        <tr>
          <th>Sl.No</th>
          <th className="text-left px-3 py-2">Item Name</th>
          <th className="text-left px-3 py-2">Sale Price</th>
          <th className="text-left px-3 py-2">Purchase Price</th>
          <th className="text-left px-3 py-2">Stock</th>
        </tr>
      </thead>
      <tbody>
        {items?.items
          ?.filter((it) =>
            it.Item_Name.toLowerCase().includes(
              (rows[i]?.itemSearch || "").toLowerCase()
            )
          )
          .map((it, idx) => (
            
//             <tr
//               key={idx}
//           onClick={() => {
   
//     setRows((prev) => {
//       const updated = [...prev];
//       updated[i] = {
//         ...updated[i],
//         Item_Category: it.Item_Category || "",
//         Item_HSN: it.Item_HSN || "",
//         categorySearch: it.Item_Category || "", // ✅ sync UI state
//         isExistingItem: true,   // lock category
//         isHSNLocked: true,      // lock HSN
//         isUnitLocked: true,     // lock unit
//       };
//       return updated;
//     });
//   handleRowChange(i, "itemSearch", it.Item_Name);
//   handleRowChange(i, "isExistingItem", true); // ✅ mark as existing
// handleRowChange(i,"CategoryOpen",false);
//   setValue(`items.${i}.Item_Category`, it.Item_Category, { shouldValidate: true });
//   setValue(`items.${i}.Item_Name`, it.Item_Name, { shouldValidate: true, shouldDirty: true });
//   setValue(`items.${i}.Item_HSN`, it.Item_HSN, { shouldValidate: true });
//   setValue(`items.${i}.Sale_Price`, it.Sale_Price || 0.00, { shouldValidate: true });
//   setValue(`items.${i}.Item_Unit`, it.Item_Unit, { shouldValidate: true });
//     setValue(`items.${i}.Tax_Type`, it.Tax_Type, { shouldValidate: true });
//   handleRowChange(i, "itemOpen", false);


//     const { Tax_Amount, Amount, Total_Amount,Balance_Due } = calculateRowAmount(
//     { ...itemsValues[i], 
//         Item_Name: it.Item_Name,
//     Sale_Price: it.Sale_Price || 0,
//     Quantity: itemsValues[i]?.Quantity || 0,
//     Discount_On_Sale_Price: itemsValues[i]?.Discount_On_Sale_Price || 0,
//     Discount_Type_On_Sale_Price: itemsValues[i]?.Discount_Type_On_Sale_Price,
//     Tax_Type: itemsValues[i]?.Tax_Type },
//     i,
//     itemsValues
//   );

//   setValue(`items.${i}.Tax_Amount`, Tax_Amount);
//   setValue(`items.${i}.Amount`, Amount);
//   setValue(`Total_Amount`, Total_Amount);
//   setValue(`Balance_Due`, Balance_Due);
// }}

//               className="hover:bg-gray-100 cursor-pointer border-b"
//             >
//               <td>{idx + 1}</td>
//               <td className="px-3 py-2">{it.Item_Name}</td>
//               <td className="px-3 py-2 text-gray-600">{it.Sale_Price || 0}</td>
//               <td className="px-3 py-2 text-gray-600">{it.Purchase_Price || 0}</td>
//               {/* <td className="px-3 py-2 text-gray-500">{it.Stock_Quantity || 0}</td> */}
//                               <td
//   style={{
//     padding: "0.5rem 0.75rem", // same as Tailwind px-3 py-2
//     color: it.Stock_Quantity <= 0 ? "red" : "limegreen",
//     fontWeight: "500", // optional: matches Tailwind's medium weight
//   }}
// >
//   {it.Stock_Quantity || 0}
// </td>
//             </tr>
                
<tr
  key={idx}
  onClick={() => {
    if (it.Stock_Quantity <= 0) {
      // show confirmation modal instead of directly adding
      setConfirmModal({ open: true, item: it, rowIndex: i });
      return;
    }

    // ✅ proceed directly if stock > 0
    handleItemSelect(it, i);
  }}
  className="hover:bg-gray-100 cursor-pointer border-b"
>
         <td>{idx + 1}</td>
              <td className="px-3 py-2">{it.Item_Name}</td>
              <td className="px-3 py-2 text-gray-600">{it.Sale_Price || 0}</td>
              <td className="px-3 py-2 text-gray-600">{it.Purchase_Price || 0}</td>
              {/* <td className="px-3 py-2 text-gray-500">{it.Stock_Quantity || 0}</td> */}
                              <td
  style={{
    padding: "0.5rem 0.75rem", // same as Tailwind px-3 py-2
    color: it.Stock_Quantity <= 0 ? "red" : "limegreen",
    fontWeight: "500", // optional: matches Tailwind's medium weight
  }}
>
  {it.Stock_Quantity || 0}
</td>
</tr>
    ))}  

        {items?.items?.filter((it) =>
          it.Item_Name.toLowerCase().includes(
            (rows[i]?.itemSearch || "").toLowerCase()
          )
        ).length === 0 && (
          <tr>
            <td colSpan={4} className="px-3 py-2 text-gray-400 text-center">
              No Item found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}
{confirmModal.open && (
  <div
    className="fixed inset-0 
    flex items-center justify-center 
    bg-white z-50 bg-opacity-50"
  >
    <div className="bg-white p-6 rounded-lg shadow-lg
     w-96 relative">
      <h3 style={{color:"red"}} className="text-lg font-semibold mb-4
       text-center ">
        ⚠ Item Out of Stock
      </h3>
      <p className="text-gray-700 text-center mb-6">
        The item <b>{confirmModal.item?.Item_Name}</b> has 0 stock.<br />
        Do you still want to add it?
      </p>
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            handleItemSelect(confirmModal.item, confirmModal.rowIndex);
            setConfirmModal({ open: false, item: null, rowIndex: null });
          }}
          className="px-4 py-2 rounded-md bg-[#4CA1AF] text-white 
          hover:bg-[#4CA1AF]"
        >
          Yes, Add Item
        </button>
        <button
          type="button"
          onClick={() =>
            setConfirmModal({ open: false, item: null, rowIndex: null })
          }
          style={{ outline: "none", backgroundColor: "gray" }}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300
           text-gray-700 "
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


        {/* RHF error */}
     
        </div>
      </td>

        {/*HSN Code */}
       <td style={{ padding: "0px",width: "8%"}}>
  <input
    type="text"
    readOnly
    value={rows[i]?.Item_HSN || watch(`items.${i}.Item_HSN`) || ""}
    // onChange={(e) => {
    //   if (!rows[i]?.isHSNLocked) {
    //     handleRowChange(i, "Item_HSN", e.target.value);
    //     setValue(`items.${i}.Item_HSN`, e.target.value);
    //   }
    // }}
    placeholder="HSN Code"
    className="w-full outline-none border-b-2 text-gray-900"
    // readOnly={rows[i]?.isHSNLocked} // ✅ lock if item is from dropdown
  />
   {errors?.items?.[i]?.Item_HSN && (
          <p className="text-red-500 text-xs mt-1">
            {errors.items[i].Item_HSN.message}
          </p>
        )}
</td>
{/* Quantity */}
<td style={{ padding: "0px",width: "4%" }}>
  <input
    type="text"
    className="form-control"
    style={{ width: "100%" }}
    value={watch(`items.${i}.Quantity`)?.toString() || ""}
      {...register(`items.${i}.Quantity`, { valueAsNumber: true })} 
    onChange={(e) => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      //let stockQty = items?.items?.find((item) => item.Item_Name === itemsValues[i]?.Item_Name)?.Stock_Quantity || 0;
      //console.log(stockQty);

      if (!itemsValues[i]?.Item_Name?.trim()) return;

      // ✅ Clamp value
      let num = parseInt(value, 10);

      if (isNaN(num) || num < 0) {
        num = 0; // reset to 0
      }
      // if (num > stockQty) {
      //   num = stockQty; // reset to stock
      // }

      // ✅ Update only via RHF
      setValue(`items.${i}.Quantity`, num, { shouldValidate: true });

      // ✅ Recalculate row + totals
      const { Tax_Amount, Amount, Total_Amount, Balance_Due } =
        calculateRowAmount({ ...itemsValues[i], Quantity: num||0 }, i, itemsValues);

      setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
      setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
      setValue("Total_Amount", Total_Amount, { shouldValidate: true });
      setValue("Balance_Due", Balance_Due, { shouldValidate: true });
    }}
    placeholder="Qty"
  />
  {errors?.items?.[i]?.Quantity && (
          <p className="text-red-500 text-xs mt-1">
            {errors.items[i].Quantity.message}
          </p>
        )}
</td>


      {/* Unit */}
     <td style={{ padding: "0px"  }}>
  <Controller
    control={control}
    name={`items.${i}.Item_Unit`}
    render={({ field }) => (
      <select
        {...field}
        className="form-select "
        style={{ width: "100%", fontSize: "12px",marginLeft:"0px" }}
        disabled={rows[i]?.isUnitLocked} // ✅ lock only if item is from dropdown
        onChange={(e) => {
          const value = e.target.value;
          handleRowChange(i, "Item_Unit", value);
          setValue(`items.${i}.Item_Unit`, value);
        }}
      >
        <option value="">Select</option>
        {Object.entries(itemUnits).map(([key, value]) => (
          <option key={key} value={key}>
            {`${value} (${key})`}
          </option>
        ))}
      </select>
    )}
  />
     {errors?.items?.[i]?.Item_Unit && (
          <p className="text-red-500 text-xs mt-1">
            {errors.items[i].Item_Unit.message}
          </p>
        )}
</td>


      {/* Price/Unit */}
      <td style={{ padding: "0px",width: "6%" }}>
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control"
            style={{ width: "100%", marginBottom: "0px" }}
            {...register(`items.${i}.Sale_Price`)}
        onChange={(e) => {
  let val = e.target.value;

  // ✅ allow digits and one dot
  val = val.replace(/[^0-9.]/g, "");

  // ✅ if more than one dot, keep only the first
  const parts = val.split(".");
  if (parts.length > 2) {
    val = parts[0] + "." + parts.slice(1).join(""); // collapse extra dots
  }

  // ✅ limit to 2 decimal places
  if (val.includes(".")) {
    const [int, dec] = val.split(".");
    val = int + "." + dec.slice(0, 2);
  }

  e.target.value = val;

  if (!itemsValues[i]?.Item_Name || itemsValues[i]?.Item_Name.trim() === "") {
    return;
  }

  // const { Tax_Amount, Amount,Total_Amount } = calculateRowAmount({
  //   ...itemsValues[i],
  //   Purchase_Price: val,
  // });
    const { Tax_Amount, Amount, Total_Amount,Balance_Due } = calculateRowAmount(
    { ...itemsValues[i], Sale_Price: val },
    i,
    itemsValues
  );
 
  setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
  setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
  setValue("Total_Amount", Total_Amount, { shouldValidate: true });
  setValue("Balance_Due", Balance_Due, { shouldValidate: true });
}}

            placeholder="Price"
          />
         
        </div>
        {errors?.items?.[i]?.Sale_Price && (
          <p className="text-red-500 text-xs mt-1">
            {errors.items[i].Sale_Price.message}
          </p>
        )}
      </td>

      {/* Discount */}
      <td style={{ padding: "0px",width: "14%" }}>
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control"
            style={{ width: "50%", marginBottom: "0px" }}
            {...register(`items.${i}.Discount_On_Sale_Price`)}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
  //                 const { Tax_Amount, Amount ,Total_Amount} = calculateRowAmount({
  //   ...itemsValues[i],
   
  //   Discount_On_Purchase_Price: e.target.value,
   
  // });
      const { Tax_Amount, Amount, Total_Amount,Balance_Due } = calculateRowAmount(
    { ...itemsValues[i], Discount_On_Sale_Price: e.target.value },
    i,
    itemsValues
  );
  
    setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
    setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
    setValue("Total_Amount", Total_Amount, { shouldValidate: true });
    setValue("Balance_Due", Balance_Due, { shouldValidate: true });
  // setValue(`items.${i}.Tax_Amount`, Tax_Amount);
  // setValue(`items.${i}.Amount`, Amount);
            
            }}
            placeholder="Discount"
          />
       <Controller
  control={control}
  name={`items.${i}.Discount_Type_On_Sale_Price`}
  render={({ field }) => (
    <select
      {...field}
      className="form-select ms-2"
      style={{ width: "50%", fontSize: "12px" }}
      onChange={(e) => {
        field.onChange(e); // ✅ let RHF handle its state

        // const { Tax_Amount, Amount,Total_Amount } = calculateRowAmount({
        //   ...itemsValues[i],
        //   Discount_Type_On_Purchase_Price: e.target.value,
        // });

            const { Tax_Amount, Amount, Total_Amount ,Balance_Due} = calculateRowAmount(
    { ...itemsValues[i],  Discount_Type_On_Sale_Price: e.target.value},
    i,
    itemsValues
  );

        setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
        setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
        setValue("Total_Amount", Total_Amount,  { shouldValidate: true });
        setValue("Balance_Due", Balance_Due,  { shouldValidate: true });
      }}
    >
      <option value="Percentage">%</option>
      <option value="Amount">Amount</option>
    </select>
  )}
/>
        </div>
      </td>

      
       <td style={{ padding: "0px", width: "12%" }}>
  <Controller
   
    control={control}
    name={`items.${i}.Tax_Type`}
    render={({ field }) => (
      <select
        {...field}
        className="form-select"
        style={{ width: "100%", fontSize: "12px", marginBottom: "0px" ,
              pointerEvents: "none", // ✅ visually disabled
          cursor: "not-allowed",
          backgroundColor: "#f3f4f6", // light gray
        }}
        onChange={(e) => {
          field.onChange(e); // ✅ update RHF value

          // const { Tax_Amount, Amount,Total_Amount } = calculateRowAmount({
          //   ...itemsValues[i],
          //   Tax_Type: e.target.value,
          // });
                      const { Tax_Amount, Amount, Total_Amount,Balance_Due } = calculateRowAmount(
    { ...itemsValues[i],  Tax_Type: e.target.value},
    i,
    itemsValues
  );

          setValue(`items.${i}.Tax_Amount`, Tax_Amount, { shouldValidate: true });
          setValue(`items.${i}.Amount`, Amount, { shouldValidate: true });
          setValue("Total_Amount", Total_Amount, { shouldValidate: true });
          setValue("Balance_Due", Balance_Due, { shouldValidate: true });
        }}
      >
        <option value="None">None</option>
        <option value="GST0">GST @0%</option>
        <option value="IGST0">IGST @0%</option>
        <option value="GST0.25">GST @0.25%</option>
        <option value="IGST0.25">IGST @0.25%</option>
        <option value="GST3">GST @3%</option>
        <option value="IGST3">IGST @3%</option>
        <option value="GST5">GST @5%</option>
        <option value="IGST5">IGST @5%</option>
        <option value="GST12">GST @12%</option>
        <option value="IGST12">IGST @12%</option>
        <option value="GST18">GST @18%</option>
        <option value="IGST18">IGST @18%</option>
        <option value="GST28">GST @28%</option>
        <option value="IGST28">IGST @28%</option>
        <option value="GST40">GST @40%</option>
        <option value="IGST40">IGST @40%</option>
      </select>
    )}
  />
</td>

      {/* Tax Amount */}
      <td style={{ width: "8%" }}>
        <input
          type="text"
          className="form-control"
          style={{ backgroundColor: "transparent" }}
          {...register(`items.${i}.Tax_Amount`)}
          readOnly
        />
      </td>

      {/* Amount */}
      <td style={{ width: "8%" }}>
        <input
          type="text"
          className="form-control"
          style={{ backgroundColor: "transparent" }}
          {...register(`items.${i}.Amount`)}
          readOnly
        />
      </td>
    </tr>
  ))}
</tbody>


      </table>
     

<div className="flex  justify-between gap-4 w-full"> 
      {/* Add Row Button */}
      <div>
      <button
        type="button"
        onClick={handleAddRow}
       className=" text-white font-bold py-2 px-4 rounded"
        style={{ backgroundColor: "#4CA1AF" }}
      >
        + Add Row
      </button>
      </div>
      <div className=" flex flex-col gap-2 w-1/3">
  {/* Total Amount */}
  <div className="flex justify-between items-center">
    <label className="font-medium">Total Amount</label>
    <input
      style={{ backgroundColor: "transparent" }}
      type="text"
      className="form-control  "
      {...register("Total_Amount")}
      value={watch("Total_Amount") || ""}
      readOnly
    />
  </div>

  
  <div className="flex items-center justify-between  gap-2">
  {/* Checkbox + Label */}
  <div className="flex items-center gap-2 relative">
    <input
      type="checkbox"
     
      
      id="totalPaidCheck"
      className="w-4 h-4 cursor-pointer p-3 mr-4 absolute top-0.1 right-18"
          onChange={(e) => {
  const isChecked = e.target.checked;
  const totalAmount = parseFloat(watch("Total_Amount"));

  // 🧠 If no total amount entered, do nothing
  if (!totalAmount || isNaN(totalAmount)) {
    // Optional: visually reset the checkbox
   

    // Clear both fields to stay consistent
    setValue("Total_Received", "");
    setValue("Balance_Due", "");
    return;
  }

  if (isChecked) {
    // ✅ Set Total_Received = Total_Amount, Balance_Due = 0
    setValue("Total_Received", totalAmount.toFixed(2));
    setValue("Balance_Due", 0);
  } else {
    // ✅ When unchecked, restore Balance_Due = Total_Amount
    setValue("Total_Received", "");
    setValue("Balance_Due", totalAmount.toFixed(2));
  }
}}
    />
    <label
      htmlFor="totalReceivedCheck"
      className="font-medium "
    >
      Total Received
    </label>
  </div>

  {/* Input field */}
  <input
    type="text"
    {...register("Total_Received")}
    placeholder="Enter received amount"
    onChange={(e) => {
      let val = e.target.value.replace(/[^0-9.]/g, "");

      // Allow only one dot
      const parts = val.split(".");
      if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");

      // Limit to 2 decimals
      if (val.includes(".")) {
        const [int, dec] = val.split(".");
        val = int + "." + dec.slice(0, 2);
      }

      e.target.value = val;
      setValue("Total_Received", val);

      const totalPaid = parseFloat(val || 0);
      const totalAmount = parseFloat(watch("Total_Amount") || 0);
      setValue("Balance_Due", (totalAmount - totalPaid).toFixed(2));
    }}
    className="form-control"
  />
</div>


  {/* Balance Due */}
  <div className="flex justify-between items-center">
    <label className="font-medium">Balance Due</label>
    <input
      style={{ backgroundColor: "transparent" }}
      type="text"
      className="form-control  "
      {...register("Balance_Due")}
      // value={watch("Balance_Due") || ""}
      readOnly
    />
  </div>
</div>
</div>
    </div>
 <div className="flex justify-end gap-4 mt-4">
   <button
                    type="button"
                
                    onClick={() => navigate("/sale/all-sales")}
                    className=" text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formValues.errorCount > 0 ||isAddingSale}
                    className=" text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                  {isAddingSale ? "Adding Sale..." : "Add Sale"}
                  </button>
                </div>
                                </form>
                                
                                </div>
                                

                            </div>
                        </div>
                    </div>
                </div>
        </>
    );
}
//#4CA1AF
