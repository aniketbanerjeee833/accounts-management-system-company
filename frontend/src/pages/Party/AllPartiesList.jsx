import { NavLink, useNavigate } from "react-router-dom";
import SideMenu from "../../components/SideMenu/SideMenu";
import { useGetAllPartiesQuery } from "../../redux/api/partyAPi";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";

export default function AllPartiesList() {

    const [page, setPage] = useState(1);
    // const { data: parties, isLoading, isError } = useGetAllPartiesQuery({ page });
  
    const [selectedParty, setSelectedParty] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: parties, isLoading } = useGetAllPartiesQuery({ page, search: searchTerm });
      console.log(parties);
    const navigate = useNavigate();

    const handlePartyClick = (partyId) => {
        const party = parties?.parties?.find((p) => p.Party_Id === partyId);
        setSelectedParty(party);
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
        if (parties && parties?.parties?.length > 0) {
            setSelectedParty(parties?.parties[0]);
        }
    }, [parties]);

    // Set first party as default when data is loaded

    // const filteredParties = useMemo(() => {
    //     if (!parties?.parties) return [];
    //     if (!searchTerm.trim()) return parties.parties;

    //     const lowerSearch = searchTerm.toLowerCase();
    //     return parties?.parties?.filter((party) => {
    //         return (
    //             (party?.Party_Name && party.Party_Name.toLowerCase().includes(lowerSearch)) ||
    //             (party?.GSTIN &&
    //                 party.GSTIN.toString().toLowerCase().includes(lowerSearch)) ||
    //             (party?.Phone_Number &&
    //                 party.Phone_Number.toString().toLowerCase().startsWith(lowerSearch)) ||
    //             (party?.State &&
    //                 party.State.toString().toLowerCase().startsWith(lowerSearch)) ||
    //             (party?.Email_Id &&
    //                 party.Email_Id.toString().toLowerCase().startsWith(lowerSearch)) ||
    //             (party?.Billing_Address &&
    //                 party.Billing_Address.toLowerCase().startsWith(lowerSearch))
    //         );
    //     });
    // }, [parties, searchTerm]);
    return (
        <>
            {/* // <div className="container-fluid sb2  ">
        //     <div className="row">
                
        //         <div className="sb2-1 ">

        //             <SideMenu />
        //         </div>

                
        //         <div className="sb2-2"> */}
            <div className="sb2-2-2">
                <ul >
                    <li>
                        {/* <NavLink
                                    to="/home"

                                >
                                    <i className="fa fa-home mr-2" aria-hidden="true"></i>
                                   Dashboard
                                </NavLink> */}
                        <NavLink style={{ display: "flex", flexDirection: "row" }}
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
                            {/* <div className="inn-title">
                                <div className="flex justify-between">
                                    <div>
                                        <h4 className="text-2xl font-bold mb-2">All Parties</h4>
                                        <p className="text-gray-500 mb-6">
                                            All Parties Details
                                        </p>
                                    </div>

                                
                                    <div className=" flex flex-row space-x-4">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="text"
                                                placeholder="Search parties..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full  "
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                style={{
                                                    outline: "none",
                                                    boxShadow: "none",
                                                    backgroundColor:"#4CA1AF"
                                                    // backgroundColor: "#7346ff",
                                                }}
                                                className=" text-white px-4 py-2 rounded-md"
                                                onClick={() => navigate("/party/add")}
                                            >Add  Party</button>
                                        </div>

                                  

                                    </div>
                                </div>
                            </div> */}
                                                                                                       <div className="inn-title">
  <div className="flex flex-col sm:flex-col lg:flex-row justify-between lg:items-center">
    {/* Left Section */}
    <div className="flex flex-row justify-between items-center mb-4 sm:mb-4">
         <div>
      <h4 className="text-2xl font-bold mb-1">All Parties</h4>
                                  <p className="text-gray-500 text-sm sm:text-base">
                                         All Parties Details
                                    </p>
    </div>
                                         <button
        style={{
          outline: "none",
          boxShadow: "none",
          backgroundColor: "#4CA1AF",
        }}
        className="text-white px-4 py-2 rounded-md sm:hidden"
          onClick={() => navigate("/party/add")}
      >
        Add Party
      </button>
    </div>

  
    <div
    //   className="
    //     flex flex-col gap-2 sm:flex-row sm:flex-wrap
    //     sm:space-x-4 space-y-3 sm:space-y-0
    //     sm:items-center
    //   "
       className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:items-center"
    >
   

     <div className="flex items-center w-full sm:w-56">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-56"
        />
      </div>
     
{/*      
      <div>
        <button
          style={{
            outline: "none",
            boxShadow: "none",
            backgroundColor: "#4CA1AF",
          }}
          className="text-white px-4 py-2 rounded-md w-full sm:w-auto"
             onClick={() => navigate("/party/add")}
        >
         Add  Party
        </button>
      </div> */}
         <div className="hidden sm:block">
           <button
        style={{
          outline: "none",
          boxShadow: "none",
          backgroundColor: "#4CA1AF",
        }}
        className="hidden sm:block text-white px-4 py-2 rounded-md sm:w-auto"
          onClick={() => navigate("/party/add")}
      >
        Add  Party
      </button> 
           </div>
    </div>
  </div>
   
</div>
                            <div className="tab-inn">

                                {isLoading ? (
                                    <p className="text-center mt-4">Fetching Parties...</p>
                                ) : parties?.length === 0 ? (
                                    <p className="text-center mt-4">No parties found.</p>
                                ) : (
                                    <div className="grid grid-cols-[30%_70%] gap-4">
                                        {/* Left side (Party List) */}
                                        <div className="p-2 border-r border-gray-300 overflow-x-auto ">
                                            <table className="w-full ">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left">Sl.No</th>
                                                        <th className="text-left">Party Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parties &&
                                                        parties?.parties?.length > 0 &&
                                                        parties?.parties?.map((party, idx) => (
                                                            <tr
                                                                key={party.Party_Id}
                                                                className={
                                                                    selectedParty?.Party_Id === party.Party_Id
                                                                    ? "bg-[#f3f2fd]  text-[#4CA1AF]"
                                                                        // ? "bg-[#f3f2fd]  text-[#7346ff]"
                                                                        : ""
                                                                }
                                                            >
                                                                <td>
                                                                    {(parties?.currentPage - 1) * 10 + (idx + 1)}.
                                                                </td>
                                                                <td
                                                                    onClick={() => handlePartyClick(party.Party_Id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {party.Party_Name}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Right side (Party Details) */}
                                        <div className="p-2 overflow-x-auto">
                                            {selectedParty ? (
                                                <table className="w-full min-w-[500px]">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left">GSTIN</th>
                                                            <th className="text-left">Phone</th>
                                                            <th className="text-left">State</th>
                                                            <th className="text-left">Email</th>
                                                            <th className="text-left">Billing Address</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{selectedParty?.GSTIN || "N/A"}</td>
                                                            <td>{selectedParty?.Phone_Number || "N/A"}</td>
                                                            <td>{selectedParty?.State || "N/A"}</td>
                                                            <td>{selectedParty?.Email_Id || "N/A"}</td>
                                                            <td>{selectedParty?.Billing_Address || "N/A"}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-gray-500">Select a party to view details</p>
                                            )}
                                        </div>
                                    </div>



                                )}


                            </div>
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
                            {[...Array(parties?.totalPages).keys()].map((index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    // className={`px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 'bg-gray-200 hover:bg-gray-300'
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
                                disabled={page === parties?.totalPages || parties?.totalPages === 0}
                                className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === parties?.totalPages || parties?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}