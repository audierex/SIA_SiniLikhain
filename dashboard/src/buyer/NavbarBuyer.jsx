import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));

  const handleLogoutClick = () => {
    if (!user) {
      navigate("/Login");
    } else {
      setOpenDialog(true);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setOpenDialog(false);
    setOpenSnackbar(true);
    setTimeout(() => {
      window.location.href = "/Login";
    }, 1000);
  };
  const handleCancelLogout = () => setOpenDialog(false);

  return (
    <>
      <nav className="bg-[#1b2a41] px-4 py-2 flex items-center justify-between" style={{ fontFamily: 'SF Pro Display, SF Pro Icons, Arial, sans-serif' }}>
        <div className="text-white text-2xl font-bold tracking-wide">SiniLikhain</div>
        <div className="flex gap-4">
          <Link to="/home" className="text-white hover:text-blue-300 px-3 py-1 rounded transition-colors duration-200 font-medium">Home</Link>
          <Link to="/buyer" className="text-white hover:text-blue-300 px-3 py-1 rounded transition-colors duration-200 font-medium">Products</Link>
          <Link to="/cart" className="text-white hover:text-blue-300 px-3 py-1 rounded transition-colors duration-200 font-medium">Cart</Link>
          <Link to="/aboutbuyer" className="text-white hover:text-blue-300 px-3 py-1 rounded transition-colors duration-200 font-medium">About</Link>
          <button onClick={handleLogoutClick} className="text-white hover:text-red-400 px-3 py-1 rounded transition-colors duration-200 font-medium">
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </nav>

      {/* Logout Dialog */}
      {openDialog && user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80" style={{ fontFamily: 'SF Pro Display, SF Pro Icons, Arial, sans-serif' }}>
            <div className="text-lg font-semibold mb-2">Confirm Logout</div>
            <div className="mb-4 text-gray-700">Are you sure you want to log out of your account?</div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelLogout} className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium">Cancel</button>
              <button onClick={handleConfirmLogout} className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-medium">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {openSnackbar && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-2 rounded shadow-lg font-medium" style={{ fontFamily: 'SF Pro Display, SF Pro Icons, Arial, sans-serif' }}>
            Successfully logged out!
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
