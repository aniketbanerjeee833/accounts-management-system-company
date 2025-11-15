import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { partyApi, useAddPartyMutation } from "../../redux/api/partyAPi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { partyFormSchema } from "../../schema/partyFormSchema";

export default function PartyAddModal({ onClose,onSave }) {
        const navigate = useNavigate();
        const dispatch = useDispatch();
    
        const [activeTab, setActiveTab] = useState("GST & Address");
       const[shippingAdress, setShippingAddress] = useState(false);
    
        const[addParty, { isLoading, isSuccess }] = useAddPartyMutation();
      
    
    
    
    
    
        const {
            register,
          
            setValue,
            watch,
            formState: { errors },
        } = useForm({
            resolver: zodResolver(partyFormSchema)
    
        })
        const formValues = watch();
        console.log("Current form values:", formValues);
        console.log("Form errors:", errors);
    
    
        const handleSubmit = async () => {
            console.log("Form Data (from RHF):", formValues);
            if(formValues.Party_Name === ""){
                toast.error("Party Name is required");
                return;
            }
            try {
                const res = await addParty({
                    body: formValues,
                }).unwrap();
    
                console.log(" successfully:", res);
                const resData=  res;
                if(!resData?.success){
                    toast.error("Failed to add new party ");
                    return;
                }else{
                    toast.success("New Party added successfully!");
                   
                    
                     onSave(resData?.Party_Name);
                     dispatch(partyApi.util.invalidateTags(["Party"]));
               
                }
               
                
               
            
               
            } catch (error) {
                const errorMessage =
                    error?.data?.message || error?.message || "Failed to add new lead";
          
                toast.error(errorMessage);
                // toast.error("Failed to add lead");
                console.error("Submission failed", error);
            }
    
        }
  return (
 <div
  style={{
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)", // dim background
    backdropFilter: "blur(4px)", // blur effect
    zIndex: 50,
    padding: "1rem", // ensures spacing on small screens
  }}
>
    <div
      className="bg-white 
      w-full max-w-4xl rounded-lg 
      shadow-lg p-6 
      overflow-y-auto max-h-[90vh]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6"
      style={{marginBottom:"20px",paddingBottom:"10px"}}>
        <h4 className="text-xl font-semibold text-gray-900">Add New Party</h4>
        <button
          type="button"
          style={{ backgroundColor: "transparent" }}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Form Content */}
      <div>
        <div className="grid grid-cols-3 gap-6">
          {/* Party Name */}
          <div className="flex flex-col mt-2 relative">
            <label
      htmlFor="Party_Name"
      className="active"
    //   style={{
    //     position: "absolute",
    //     top: "-px",   // ✅ shifted up slightly
    //     left: "0px",
    //   }}
    >
              Party Name
              <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
            </label>
            <input
              type="text"
              id="Party_Name"
              {...register("Party_Name")}
              style={{marginLeft:"10px"}}
              placeholder="Party Name"
              className="w-full outline-none border-b-2 text-gray-900"
            />
            {errors?.Party_Name && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.Party_Name?.message}
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div className="flex flex-col mt-2 relative">
                   <label
      htmlFor="GSTIN"
      className="active"
    
    > GSTIN</label>
            <input
              type="text"
              id="GSTIN"
               style={{marginLeft:"10px"}}
              {...register("GSTIN")}
              placeholder="GSTIN"
              className="w-full outline-none border-b-2 text-gray-900"
            />
            {errors?.GSTIN && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.GSTIN?.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col mt-2 relative" >
                <label
      htmlFor="Phone_Number"
      className="active"
    
    >Phone Number</label>
            <input
              type="text"
              id="Phone_Number"
               style={{marginLeft:"10px"}}
              {...register("Phone_Number")}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
              }}
              placeholder="Phone Number"
              className="w-full outline-none border-b-2 text-gray-900 "
            />
            {errors?.Phone_Number && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.Phone_Number?.message}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-300 flex space-x-8">
            {["GST & Address"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  padding: "0.5rem 1rem",
                  borderBottom: activeTab === tab ? "1px solid red" : "none",
                  color: activeTab === tab ? "red" : "gray",
                  fontWeight: activeTab === tab ? "600" : "500",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grey Box Section */}
          {/* <div className="bg-gray-100 p-6 mt-4 rounded">
            {activeTab === "GST & Address" && (
              <>
                <div className="grid grid-cols-2 gap-4 ">
                 
                  <div className="flex flex-col gap-12 mt-2">
               
                    <div className="flex flex-col relative ">
                      <label htmlFor="State" className="active mb-4"
                      style={{paddingBottom:"5px"}}>
                        State
                      </label>
                      <select
                        id="State"
                        style={{marginLeft:"10px"}}
                        {...register("State")}
                        className="w-full outline-none border-b-2 text-gray-900 bg-white"
                      >
                        <option value="">Select State</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Maharashtra">Maharashtra</option>
                      </select>
                      {errors?.State && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors?.State?.message}
                        </p>
                      )}
                    </div>

              
                    <div className="flex flex-col relative">
                      <label htmlFor="Email_Id" className="active"
                       style={{paddingBottom:"5px"}}>
                        Email ID
                      </label>
                      <input
                      style={{marginLeft:"10px"}}
                        type="email"
                        id="Email_Id"
                        {...register("Email_Id")}
                        placeholder="example@email.com"
                        className="w-full outline-none border-b-2 text-gray-900 bg-white"
                      />
                      {errors?.Email_Id && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors?.Email_Id?.message}
                        </p>
                      )}
                    </div>
                  </div>

               
                  <div className="flex flex-col gap-2  mt-2">
                 
                    <div className="flex flex-col relative">
                      <label htmlFor="Billing_Address" className="active"
                      style={{marginBottom:"10px",paddingBottom:"5px"}}>
                        Billing Address
                      </label>
                      <textarea
                        id="Billing_Address"
                         style={{marginLeft:"10px"}}
                        {...register("Billing_Address")}
                        className="w-full outline-none text-gray-900 bg-white border border-gray-300 rounded-md p-2 h-40 resize-none"
                        placeholder="Enter Billing Address"
                      ></textarea>
                      {errors?.Billing_Address && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors?.Billing_Address?.message}
                        </p>
                      )}
                    </div>

            
                    <p
                      className="text-blue-500 cursor-pointer ml-2"
                      onClick={() => setShippingAddress(!shippingAdress)}
                    >
                      {shippingAdress ? "Hide Shipping Address" : "Add Shipping Address"}
                    </p>

                    {shippingAdress && (
                      <div className="flex flex-col">
                        <label htmlFor="Shipping_Address" className="active"
                         style={{marginBottom:"10px",paddingBottom:"5px"}}>
                          Shipping Address
                        </label>
                        <textarea
                           style={{marginLeft:"10px"}}
                          id="Shipping_Address"
                          {...register("Shipping_Address")}
                          className="w-full outline-none text-gray-900 bg-white border border-gray-300 rounded-md p-2 h-40 resize-none"
                          placeholder="Enter Shipping Address"
                        ></textarea>
                        {errors?.Shipping_Address && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.Shipping_Address?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                
                <div className="flex justify-end gap-4 mt-6">
                       <button
                    type="button"
                    
                   onClick={() => onClose()}
                    className="text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                   Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={formValues.errorCount > 0}
                    className="text-white font-bold py-2 px-4 rounded"
                    style={{ backgroundColor: "#4CA1AF" }}
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div> */}
          <div className="bg-gray-100 p-4 sm:p-6 mt-4 rounded-lg">
  {activeTab === "GST & Address" && (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 mt-2">
          {/* State */}
          <div className="flex flex-col">
            <label
              htmlFor="State"
              className="mb-2 text-sm font-semibold text-gray-700"
            >
              State
            </label>
            <select
              id="State"
              {...register("State")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900  outline-none transition-all"
            >
              <option value="">Select State</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
            {errors?.State && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.State?.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label
              htmlFor="Email_Id"
              className="mb-2 text-sm font-semibold text-gray-700"
            >
              Email ID
            </label>
            {/* <input
              type="email"
              id="Email_Id"
              {...register("Email_Id")}
              placeholder="example@email.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-[#4CA1AF] outline-none transition-all"
            /> */}
               <input
                     
                        type="email"
                        id="Email_Id"
                        {...register("Email_Id")}
                        placeholder="example@email.com"
                        className="w-full outline-none border-b-2 text-gray-900 bg-white"
                      />
            {errors?.Email_Id && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.Email_Id?.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Billing Address */}
          <div className="flex flex-col">
            <label
              htmlFor="Billing_Address"
              className="mb-2 text-sm font-semibold text-gray-700"
            >
              Billing Address
            </label>
            <textarea
              id="Billing_Address"
              {...register("Billing_Address")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 h-32 sm:h-40 resize-none  outline-none"
              placeholder="Enter Billing Address"
            ></textarea>
            {errors?.Billing_Address && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.Billing_Address?.message}
              </p>
            )}
          </div>

          {/* Shipping Address Toggle */}
          <p
            className="text-[#4CA1AF] cursor-pointer font-medium hover:underline mt-2"
            onClick={() => setShippingAddress(!shippingAdress)}
          >
            {shippingAdress
              ? "Hide Shipping Address"
              : "Add Shipping Address"}
          </p>

          {shippingAdress && (
            <div className="flex flex-col">
              <label
                htmlFor="Shipping_Address"
                className="mb-2 text-sm font-semibold text-gray-700"
              >
                Shipping Address
              </label>
                 <textarea
                           
                          id="Shipping_Address"
                          {...register("Shipping_Address")}
                          className="w-full outline-none text-gray-900 bg-white border border-gray-300 rounded-md p-2 h-40 resize-none"
                          placeholder="Enter Shipping Address"
                        ></textarea>
              {errors?.Shipping_Address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors?.Shipping_Address?.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
        <button
          type="button"
          onClick={() => onClose()}
          className="text-white
           font-semibold py-2 px-4
            rounded-md w-full sm:w-auto"
          style={{ backgroundColor: "#4CA1AF" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={formValues.errorCount > 0}
          className="text-white font-semibold py-2 px-4 rounded-md w-full sm:w-auto"
          style={{ backgroundColor: "#4CA1AF" }}
        >
          Save
        </button>
      </div>
    </>
  )}
</div>

        </div>
      </div>
    </div>
  </div>
);

}
       
           