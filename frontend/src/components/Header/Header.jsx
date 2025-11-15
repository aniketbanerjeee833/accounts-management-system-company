import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "../../redux/api/userApi";
import { setUser, setUserId } from "../../redux/reducer/userReducer";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import MobileSideMenu from "../MobileSideMenu/MobileSideMenu";
import { LogOut,ChevronUp, ChevronDown } from 'lucide-react';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
 const[mobileViewSideBarOpen, setMobileViewSideBarOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
   const dispatch = useDispatch();
   const IconComponent = dropdownOpen ? ChevronUp : ChevronDown;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    console.log("Dropdown toggled", !dropdownOpen);
    setDropdownOpen(!dropdownOpen);
  };

  const[logoutUser,{isLoading}]= useLogoutUserMutation();

  const handleLogout = async (e) => {
    

    try{
      const response = await logoutUser().unwrap();
      console.log("Logout Response:", response);
      if(response.success){
        console.log(response.message);
        // ✅ Clear Redux user slice completely
        // dispatch(setLoggedIn(false));
        dispatch(setUserId(null));
         dispatch(setUser(null));
         toast.success(response?.message || 'Logout successful');
        window.location.href = "/login"; // hard redirect clears memory
    }
  } catch(err){
    console.error('Logout error:', err);
    toast.error(err?.data?.message || 'Logout failed');
  }
  //   try {
  //     const response = await axios.post('http://localhost:4000/api/user/logout', {}, { 
  //       withCredentials: true 
  //     });
      
  //     console.log("Logout Response:", response);
  //     console.log("Response Data:", response.data);
      
  //     if (response.status === 200) {
  //       console.log(response.data.message);
  //       dispatch(setLoggedIn(false));
  //       dispatch(setUserId(null));
  //       dispatch(setUser(null));
  //       navigate('/login');
  //     } else {
  //       console.error('Logout failed:', response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error during logout:', error);
  //     if (error.response) {
  //       console.error('Server responded with:', error.response.data);
  //     }
    }
  const handleToggleMobileViewOpen = () => {
    setMobileViewSideBarOpen(!mobileViewSideBarOpen);
  };
  
  const handleCloseMobileMenu = () => {
    setMobileViewSideBarOpen(false);
  };

  return (
    <>
       
        <div className="container-fluid sb1 ">
          <div className="row ">
               
     
        <div className="col-md-2 col-sm-3 col-xs-6 sb1-1 flex items-center align-center">
          <div className="mr-1">
               {/* {mobileViewSideBarOpen && <NavLink
  onClick={()=>setMobileViewSideBarOpen(false)}
  className="btn btn-close-menu"
  style={{
  
    display: "inline-flex",
    cursor: "pointer",
    position: "absolute",
    top: "10px",
    right: "5px",
    zIndex: 1100
  }}
>
  
<i className="fa fa-times" aria-hidden="true"></i>
</NavLink>} */}
     <span className="atab-menu " onClick={() => handleToggleMobileViewOpen()}>
     <i className="fa fa-bars tab-menu" aria-hidden="true"></i>
       </span>
         



        </div>
        <i className="fa fa-cubes text-xl text-blue-500 mr-2" aria-hidden="true"></i>
   
<span className="font-semibold text-lg whitespace-nowrap">Inventory Management</span>



        </div>
         {/* MY ACCOUNT */}
        <div 
          className="col-md-2 col-sm-3 col-xs-6 justify-end ms-auto" 
          ref={dropdownRef}
          style={{ position: 'relative' }}
        >
          <NavLink
            className="waves-effect dropdown-button top-user-pro
             flex items-center justify-between cursor-pointer"
            data-activates="top-menu"
            onClick={(e) => {
              e.preventDefault();
              toggleDropdown();
            }}
           
          >
            
            Admin Account 
            <IconComponent size={20} style={{ marginLeft: '5px' }} />
             {/* <i className={`fa ${dropdownOpen ? 'fa-angle-up' : 'fa-angle-down'}`} aria-hidden="true"></i> */}
          </NavLink>

          {dropdownOpen && (
            <ul 
              id="top-menu" 
             
              style={{
                position: 'absolute',
                left:"-52px",
                top: '80%',
                right: '0',
                backgroundColor: 'white',
                minWidth: '200px',
                boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
                zIndex: 9999,
                borderRadius: '4px',
                listStyle: 'none',
                padding: '0',
                margin: '0',
                border: '1px solid #ddd',
                display: 'block'
              }}
            >
           
              <li style={{ margin: '0', padding: '0' }}>
                <button
                  onClick={(e) => {

                    e.preventDefault();
                    handleLogout();
                  }}
                  className="ho-dr-con-last waves-effect dropdown-item "
                  style={{
                    display:"flex",
                    flexDirection: 'row',
                    border: 'none', 
                    background: 'transparent', 
                    width: '100%', 
                    textAlign: 'left',
                    padding: '12px 16px',
                    cursor: 'pointer',
                   
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f1f1'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {/* <i className="fa fa-sign-in" aria-hidden="true"></i> Logout */}
                  <LogOut size={20} style={{ marginRight: '8px' }} />
                  Logout
                </button>
              </li>
            
            </ul>
          )}
        </div>

       
      </div>
    </div>
  
  {mobileViewSideBarOpen && 
     <div className="sb2-1">
  <MobileSideMenu onClose={handleCloseMobileMenu} 
  
  />
   </div>}
   
    </>
  );
};
export default Header;