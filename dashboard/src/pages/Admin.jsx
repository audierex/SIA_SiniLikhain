import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
// Using Font Awesome for icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, faUser, faPalette, faBoxesStacked, faSignOut, 
  faEdit, faTrash, faSave, faBan, faCheck, faTimes,
  faEye, faEyeSlash, faChartLine
} from '@fortawesome/free-solid-svg-icons';

// Register Chart.js components
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

  // Function to generate mock time series data for the past 7 days
  const generateTimeSeriesData = () => {
    const labels = [];
    const approvedData = [];
    const pendingData = [];
    const totalUsers = [];
    
    // Generate dates for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate some random but plausible data
      const baseApproved = products.filter(p => p.approved).length;
      const basePending = products.filter(p => !p.approved).length;
      const baseUsers = users.length;
      
      // Add some random variation
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
  
  // Generate chart data whenever products or users data changes
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
    navigate("/Login");
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
    // Data validation
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
    await axios.delete(`http://localhost:5000/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };  const navItems = [
    { label: "Overview", value: "overview", icon: faGaugeHigh },
    { label: "Buyers", value: "buyer", icon: faUser },
    { label: "Artisans", value: "artisan", icon: faPalette },
    { label: "Products", value: "crud", icon: faBoxesStacked }
  ];

  const buyers = users.filter(u => u.role === "buyer");
  const artisans = users.filter(u => u.role === "artisan");
  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1b2a41] text-[#ccc9dc] transition-all duration-300 shrink-0 shadow-lg`}>
        <div className="p-4">
          <h1 className="font-bold text-xl mb-6">Admin Panel</h1>
          
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.value}>
                <button 
                  onClick={() => setView(item.value)} 
                  className={`w-full flex items-center p-2 rounded-lg transition-colors duration-150 
                  ${view === item.value ? 'bg-blue-900/30 text-blue-400' : 'hover:bg-blue-900/20'}`}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={`${view === item.value ? 'text-blue-400' : 'text-[#ccc9dc]'} w-5 h-5`} 
                  />
                  <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center p-2 rounded-lg hover:bg-blue-900/20 transition-colors duration-150"
              >
                <FontAwesomeIcon icon={faSignOut} className="text-[#ccc9dc] w-5 h-5" />
                <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
              </button>
            </li>
          </ul>
        </div>      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto text-black">        {view === "overview" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faGaugeHigh} className="mr-2" />
              Overview Dashboard
            </h1>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 transform transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-semibold">Total Users</span>
                  <span className="p-2 bg-blue-100 rounded-full">
                    <FontAwesomeIcon icon={faUser} className="text-blue-500 h-5 w-5" />
                  </span>
                </div>
                <div className="text-3xl font-bold">{users.length}</div>
                <div className="text-gray-500 text-sm mt-2">
                  {buyers.length} buyers, {artisans.length} artisans
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500 transform transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-semibold">Total Products</span>
                  <span className="p-2 bg-amber-100 rounded-full">
                    <FontAwesomeIcon icon={faBoxesStacked} className="text-amber-500 h-5 w-5" />
                  </span>
                </div>
                <div className="text-3xl font-bold">{products.length}</div>
                <div className="text-gray-500 text-sm mt-2">
                  {products.filter(p => p.approved).length} approved, {products.filter(p => !p.approved).length} pending
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 transform transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-semibold">Approval Rate</span>
                  <span className="p-2 bg-green-100 rounded-full">
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 h-5 w-5" />
                  </span>
                </div>
                <div className="text-3xl font-bold">
                  {products.length > 0 ? Math.round((products.filter(p => p.approved).length / products.length) * 100) : 0}%
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  {products.filter(p => p.approved).length} of {products.length} products
                </div>
              </div>            </div>
            
            {/* Activity Graph */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Activity Overview
              </h2>
              <div className="h-[300px] w-full">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                          usePointStyle: true,
                          boxWidth: 8
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#111',
                        bodyColor: '#555',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4,
                        usePointStyle: true,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                    elements: {
                      point: {
                        radius: 3,
                        hoverRadius: 5
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FontAwesomeIcon icon={faBoxesStacked} className="mr-2" /> Product Distribution
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Approved</span>
                      <span>{products.filter(p => p.approved).length} products</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${products.length > 0 ? (products.filter(p => p.approved).length / products.length) * 100 : 0}%` }} 
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pending</span>
                      <span>{products.filter(p => !p.approved).length} products</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${products.length > 0 ? (products.filter(p => !p.approved).length / products.length) * 100 : 0}%` }} 
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> User Distribution
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Buyers</span>
                      <span>{buyers.length} users</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${users.length > 0 ? (buyers.length / users.length) * 100 : 0}%` }} 
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Artisans</span>
                      <span>{artisans.length} users</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${users.length > 0 ? (artisans.length / users.length) * 100 : 0}%` }} 
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart - Time Series Data */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Activity Over Time
              </h2>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  interaction: {
                    mode: 'index',
                    intersect: false
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
                      },
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Count'
                      },
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}{view === "buyer" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Buyers
            </h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-gray-500 font-medium">Username</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Email</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Phone Number</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Password</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {buyers.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="username" 
                              value={editUserData.username} 
                              onChange={handleEditChange} 
                            />
                          ) : u.username}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="email" 
                              value={editUserData.email || u.email || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.email || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="phone" 
                              value={editUserData.phone || u.phone || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.phone || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="relative">
                              <input 
                                className="border rounded px-2 py-1 w-full pr-10"
                                name="password" 
                                value={editUserData.password || ''} 
                                onChange={handleEditChange} 
                                type={showPasswordId === u._id ? "text" : "password"}
                              />
                              <button 
                                className="absolute inset-y-0 right-0 px-3"
                                onClick={() => setShowPasswordId(showPasswordId === u._id ? null : u._id)}
                              >
                                <FontAwesomeIcon icon={showPasswordId === u._id ? faEyeSlash : faEye} 
                                  className="text-gray-500 h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-mono">
                                {showPasswordId === u._id ? (u.password || '') : (u.password ? '••••••' : '')}
                              </span>
                              <button 
                                className="ml-2"
                                onClick={() => setShowPasswordId(showPasswordId === u._id ? null : u._id)}
                              >
                                <FontAwesomeIcon icon={showPasswordId === u._id ? faEyeSlash : faEye} 
                                  className="text-gray-500 h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditSave(u._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faSave} className="mr-1 h-3 w-3" />
                                Save
                              </button>
                              <button 
                                onClick={() => setEditUserId(null)}
                                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faBan} className="mr-1 h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditClick(u)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{view === "artisan" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faPalette} className="mr-2" />
              Artisans
            </h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-gray-500 font-medium">Username</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Email</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Phone Number</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Password</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {artisans.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="username" 
                              value={editUserData.username} 
                              onChange={handleEditChange} 
                            />
                          ) : u.username}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="email" 
                              value={editUserData.email || u.email || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.email || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <input 
                              className="border rounded px-2 py-1 w-full"
                              name="phone" 
                              value={editUserData.phone || u.phone || ''} 
                              onChange={handleEditChange} 
                            />
                          ) : u.phone || ''}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="relative">
                              <input 
                                className="border rounded px-2 py-1 w-full pr-10"
                                name="password" 
                                value={editUserData.password || ''} 
                                onChange={handleEditChange} 
                                type={showPasswordId === u._id ? "text" : "password"}
                              />
                              <button 
                                className="absolute inset-y-0 right-0 px-3"
                                onClick={() => setShowPasswordId(showPasswordId === u._id ? null : u._id)}
                              >
                                <FontAwesomeIcon icon={showPasswordId === u._id ? faEyeSlash : faEye} 
                                  className="text-gray-500 h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-mono">
                                {showPasswordId === u._id ? (u.password || '') : (u.password ? '••••••' : '')}
                              </span>
                              <button 
                                className="ml-2"
                                onClick={() => setShowPasswordId(showPasswordId === u._id ? null : u._id)}
                              >
                                <FontAwesomeIcon icon={showPasswordId === u._id ? faEyeSlash : faEye} 
                                  className="text-gray-500 h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editUserId === u._id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditSave(u._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faSave} className="mr-1 h-3 w-3" />
                                Save
                              </button>
                              <button 
                                onClick={() => setEditUserId(null)}
                                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faBan} className="mr-1 h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditClick(u)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{view === "crud" && (
          <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faBoxesStacked} className="mr-2" />
              Products
            </h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Artisan</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Category</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.artisan}</td>
                        <td className="px-6 py-4">{p.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${p.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {!p.approved && (
                              <button 
                                onClick={() => handleApprove(p._id)} 
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faCheck} className="mr-1 h-3 w-3" />
                                Approve
                              </button>
                            )}
                            {p.approved && (
                              <button 
                                onClick={() => handleReject(p._id)} 
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded flex items-center"
                              >
                                <FontAwesomeIcon icon={faTimes} className="mr-1 h-3 w-3" />
                                Reject
                              </button>
                            )}
                            <button 
                              onClick={async () => {
                                if(window.confirm('Are you sure you want to delete this product?')) {
                                  await axios.delete(`http://localhost:5000/products/${p._id}`);
                                  setProducts(products.filter(prod => prod._id !== p._id));
                                }
                              }} 
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1 h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
