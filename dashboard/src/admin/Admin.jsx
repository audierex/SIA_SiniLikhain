import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, faUser, faPalette, faBoxesStacked, faSignOut, 
  faEdit, faTrash, faSave, faBan, faCheck, faTimes,
  faEye, faEyeSlash, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import AdminDashboard from './AdminDashboard';
import AdminSidebar from './AdminSidebar';
import { Snackbar, Alert } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('overview');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', role: '' });
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const toggleDarkMode = () => setDarkMode(d => !d);

  const generateTimeSeriesData = () => {
    const labels = [];
    const approvedData = [];
    const pendingData = [];
    const totalUsers = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      const baseApproved = products.filter(p => p.approved).length;
      const basePending = products.filter(p => !p.approved).length;
      const baseUsers = users.length;

      approvedData.push(Math.max(0, baseApproved - i + Math.floor(Math.random() * 5)));
      pendingData.push(Math.max(0, basePending - Math.floor(i/2) + Math.floor(Math.random() * 3)));
      totalUsers.push(Math.max(0, baseUsers - i + Math.floor(Math.random() * 3)));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Approved Products',
          data: approvedData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Pending Products',
          data: pendingData,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total Users',
          data: totalUsers,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };
  useEffect(() => {
    axios.get("http://localhost:5000/users/all").then(res => setUsers(res.data));
    axios.get("http://localhost:5000/products?admin=true").then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    if (products.length > 0 || users.length > 0) {
      setChartData(generateTimeSeriesData());
    }
  }, [products, users]);

  useEffect(() => {
    setChartData(generateTimeSeriesData());
  }, [users, products]);

  const handleApprove = async (id) => {
    await axios.patch(`http://localhost:5000/products/${id}/approve`);
    setProducts(products => products.map(p => p._id === id ? { ...p, approved: true } : p));
  };

  const handleReject = async (id) => {
    await axios.patch(`http://localhost:5000/products/${id}/reject`);
    setProducts(products => products.map(p => p._id === id ? { ...p, approved: false } : p));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setSnackbarOpen(true);
    setTimeout(() => navigate("/Login"), 1200);
  };

  const handleEditClick = (user) => {
    setEditUserId(user._id);
    setEditUserData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: user.password || '',
      role: user.role || ''
    });
  };

  const handleEditChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    let currentErrors = {};
    let isValid = true;
    if (!editUserData.username.trim()) {
      currentErrors.username = "Username is required.";
      isValid = false;
    } else if (editUserData.username.trim().length < 3) {
      currentErrors.username = "Username must be at least 3 characters long.";
      isValid = false;
    }
    if (!editUserData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserData.email.trim())) {
      currentErrors.email = "Valid email is required.";
      isValid = false;
    }
    if (!editUserData.phone || !/^\d{10,15}$/.test(editUserData.phone.trim())) {
      currentErrors.phone = "Phone number must be 10-15 digits.";
      isValid = false;
    }
    if (!editUserData.password || editUserData.password.length < 6) {
      currentErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }
    if (!isValid) {
      alert(Object.values(currentErrors).join('\n'));
      return;
    }
    const res = await axios.put(`http://localhost:5000/users/${id}`, editUserData);
    setUsers(users.map(u => u._id === id ? res.data : u));
    setEditUserId(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Do you want to delete this user?')) return;
    await axios.delete(`http://localhost:5000/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };
  const navItems = [
    { label: "Dashboard", value: "overview", icon: faGaugeHigh },
    { label: "Buyers", value: "buyer", icon: faUser },
    { label: "Artisans", value: "artisan", icon: faPalette },
    { label: "Products", value: "crud", icon: faBoxesStacked }
  ];

  const buyers = users.filter(u => u.role === "buyer");
  const artisans = users.filter(u => u.role === "artisan");
  return (
    <div className={`flex h-screen ${darkMode ? 'bg-[#18181b] text-gray-100' : 'bg-gray-100 text-black'} poppins-font`}>
      <AdminSidebar
        view={view}
        setView={setView}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        navItems={navItems}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {view === "overview" && (
          <>
            <AdminDashboard
              users={users}
              products={products}
              buyers={buyers}
              artisans={artisans}
              chartData={chartData}
              sidebarOpen={sidebarOpen}
              view={view}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </>
        )}{view === "buyer" && (
          <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-600" />
              Buyers Management
            </h1>
            <div className={`rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'dark:bg-[#292930] dark:text-gray-100 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">All Buyers ({buyers.length})</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-left`}>
                  <thead className={`${darkMode ? 'bg-[#23232b] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Username</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Phone Number</th>
                      <th className="px-6 py-4 font-medium">Password</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {buyers.map(u => (
                      <tr key={u._id} className={`${darkMode ? 'text-gray-300 hover:bg-[#2a2a33]' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4 font-medium">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="username" 
                              value={editUserData.username} 
                              onChange={handleEditChange} 
                            />
                          ) : u.username}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="email" 
                              value={editUserData.email || u.email || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.email || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="phone" 
                              value={editUserData.phone || u.phone || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.phone || ''}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">••••••</span>
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditSave(u._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                              >
                                <FontAwesomeIcon icon={faSave} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Save</span>
                              </button>
                              <button 
                                onClick={() => setEditUserId(null)}
                                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} px-3 py-2 rounded-lg flex items-center transition-colors shadow-md`}
                              >
                                <FontAwesomeIcon icon={faBan} className="mr-2" style={{color: darkMode ? "white" : "black"}} />
                                <span style={{color: darkMode ? "white" : "black"}}>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                                style={{backgroundColor: "#dc2626"}}
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {buyers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No buyers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{view === "artisan" && (
          <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center">
              <FontAwesomeIcon icon={faPalette} className="mr-3 text-purple-600" />
              Artisans Management
            </h1>
            <div className={`rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'dark:bg-[#292930] dark:text-gray-100 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">All Artisans ({artisans.length})</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-left`}>
                  <thead className={`${darkMode ? 'bg-[#23232b] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Username</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Phone Number</th>
                      <th className="px-6 py-4 font-medium">Password</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {artisans.map(u => (
                      <tr key={u._id} className={`${darkMode ? 'text-gray-300 hover:bg-[#2a2a33]' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4 font-medium">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="username" 
                              value={editUserData.username} 
                              onChange={handleEditChange} 
                            />
                          ) : u.username}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="email" 
                              value={editUserData.email || u.email || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.email || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className={`border rounded px-3 py-2 w-full ${darkMode ? 'bg-[#3a3a43] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                              name="phone" 
                              value={editUserData.phone || u.phone || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.phone || ''}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">••••••</span>
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditSave(u._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                              >
                                <FontAwesomeIcon icon={faSave} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Save</span>
                              </button>
                              <button 
                                onClick={() => setEditUserId(null)}
                                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} px-3 py-2 rounded-lg flex items-center transition-colors shadow-md`}
                              >
                                <FontAwesomeIcon icon={faBan} className="mr-2" style={{color: darkMode ? "white" : "black"}} />
                                <span style={{color: darkMode ? "white" : "black"}}>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                                style={{backgroundColor: "#dc2626"}}
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {artisans.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No artisans found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{view === "crud" && (
          <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center">
              <FontAwesomeIcon icon={faBoxesStacked} className="mr-3 text-amber-600" />
              Products Management
            </h1>
            
            <div className={`rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'dark:bg-[#292930] dark:text-gray-100 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center">
                <h2 className="text-lg font-semibold mb-2 sm:mb-0">All Products ({products.length})</h2>
                <div className="flex items-center flex-wrap">
                  <div className="mr-6 mb-2 sm:mb-0 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className={`${darkMode ? 'text-green-200' : 'text-green-700'} text-sm font-medium`}>
                      Approved: {products.filter(p => p.approved).length}
                    </span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    <span className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} text-sm font-medium`}>
                      Pending: {products.filter(p => !p.approved).length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-left`}>
                  <thead className={`${darkMode ? 'bg-[#23232b] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Artisan</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {products.map(p => (
                      <tr key={p._id} className={`${darkMode ? 'text-gray-300 hover:bg-[#2a2a33]' : 'text-gray-700 hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4">{p.artisan}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            darkMode 
                              ? p.category === 'Painting' ? 'bg-blue-900 text-blue-200' : 
                                p.category === 'Sculpture' ? 'bg-purple-900 text-purple-200' : 
                                p.category === 'Pottery' ? 'bg-orange-900 text-orange-200' : 
                                'bg-gray-700 text-gray-300'
                              : p.category === 'Painting' ? 'bg-blue-100 text-blue-800' : 
                                p.category === 'Sculpture' ? 'bg-purple-100 text-purple-800' : 
                                p.category === 'Pottery' ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-100 text-gray-800'
                          }`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center
                            ${p.approved 
                                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' 
                                : darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${p.approved ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {p.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {!p.approved && (
                              <button 
                                onClick={() => handleApprove(p._id)} 
                                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                                style={{backgroundColor: "#16a34a"}}
                              >
                                <FontAwesomeIcon icon={faCheck} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Approve</span>
                              </button>
                            )}
                            {p.approved && (
                              <button 
                                onClick={() => handleReject(p._id)} 
                                className="bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                                style={{backgroundColor: "#d97706"}}
                              >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" style={{color: "white"}} />
                                <span style={{color: "white"}}>Reject</span>
                              </button>
                            )}
                            <button 
                              onClick={async () => {
                                if(window.confirm('Do you want to delete this product?')) {
                                  await axios.delete(`http://localhost:5000/products/${p._id}`);
                                  setProducts(products.filter(prod => prod._id !== p._id));
                                }
                              }} 
                              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center transition-colors shadow-md"
                              style={{backgroundColor: "#dc2626"}}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-2" style={{color: "white"}} />
                              <span style={{color: "white"}}>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center">
                            <FontAwesomeIcon icon={faBoxesStacked} className="text-4xl mb-3 opacity-30" />
                            <p>No products found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1200}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: '100%', color: '#fff', backgroundColor: '#16a34a', fontWeight: 700 }}>
          Successfully logged out!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Admin;