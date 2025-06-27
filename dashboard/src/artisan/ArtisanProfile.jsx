import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarArtisan from "./NavbarArtisan";
import axios from "axios";

function ArtisanProfile() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const navigate = useNavigate();

  // Fetch data whenever needed
  useEffect(() => {
    // Get user from localStorage or sessionStorage
    const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    
    if (!userData || userData.role !== "artisan") {
      navigate("/");
      return;
    }
    
    setUser(userData);
    
    // Fetch the artisan's products (inventory)
    setLoading(true);
    axios.get("http://localhost:5000/products")
      .then((res) => {
        const artisanProducts = res.data.filter(p => p.artisan === userData.username);
        setInventory(artisanProducts);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(artisanProducts.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching inventory:", err);
        setLoading(false);
      });
  }, [navigate]);

  const getInventoryStats = () => {
    if (!inventory.length) return { total: 0, approved: 0, pending: 0, lowStock: 0 };
    
    const total = inventory.length;
    const approved = inventory.filter(item => item.approved).length;
    const pending = total - approved;
    const lowStock = inventory.filter(item => item.quantity && item.quantity < 5).length;
    
    return { total, approved, pending, lowStock };
  };

  // Handle sorting logic
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  // Filter and sort inventory items
  const getFilteredInventory = () => {
    if (!inventory.length) return [];
    
    return inventory
      .filter(item => {
        // Apply search filter
        const matchesSearch = searchQuery === "" || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply status filter
        const matchesStatus = 
          filterStatus === "all" || 
          (filterStatus === "approved" && item.approved) || 
          (filterStatus === "pending" && !item.approved) ||
          (filterStatus === "lowStock" && item.quantity < 5);
        
        // Apply category filter
        const matchesCategory = 
          filterCategory === "" || 
          item.category === filterCategory;
        
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Handle different sort types
        if (sortBy === "name") {
          return sortDirection === "asc" 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        }
        if (sortBy === "price") {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return sortDirection === "asc" ? priceA - priceB : priceB - priceA;
        }
        if (sortBy === "quantity") {
          const qtyA = a.quantity || 0;
          const qtyB = b.quantity || 0;
          return sortDirection === "asc" ? qtyA - qtyB : qtyB - qtyA;
        }
        return 0;
      });
  };

  // Handle quick update of product quantities
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    
    const updatedInventory = inventory.map(item => 
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setInventory(updatedInventory);
    
    // Update in the database
    axios.put(`http://localhost:5000/products/${itemId}`, { quantity: newQuantity })
      .then(() => {
        setSuccessMessage("Quantity updated successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      })
      .catch(err => {
        console.error("Error updating quantity:", err);
      });
  };

  // Format currency
  const formatPrice = (price) => {
    if (!price) return "₱0";
    return `₱${parseFloat(price).toLocaleString()}`;
  };

  // Fetch sales data 
  const fetchSalesData = () => {
    setSalesLoading(true);
    
    // This would typically come from your backend API
    // For now, we'll generate some sample data based on inventory
    setTimeout(() => {
      const lastSixMonths = [...Array(6)].map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();
      
      const mockSales = lastSixMonths.map(month => {
        // Generate random sales between 0 and the total inventory quantities
        const totalInventoryQty = inventory.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        const sales = Math.floor(Math.random() * (totalInventoryQty || 10));
        
        // Calculate revenue based on product prices
        const revenue = inventory.reduce((sum, item) => {
          const itemSold = Math.floor(Math.random() * 5); // Random sales for each product
          return sum + (itemSold * (parseFloat(item.price) || 0));
        }, 0);
        
        return {
          month,
          sales,
          revenue
        };
      });
      
      setSalesData(mockSales);
      setSalesLoading(false);
      setShowSalesModal(true);
    }, 800);
  };
  
  // Fetch market insights data
  const fetchMarketInsights = () => {
    setMarketLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate insights based on the inventory
      const categoryDistribution = {};
      inventory.forEach(item => {
        const category = item.category || "Uncategorized";
        if (!categoryDistribution[category]) {
          categoryDistribution[category] = 0;
        }
        categoryDistribution[category]++;
      });
      
      const trendingCategories = Object.keys(categoryDistribution)
        .sort((a, b) => categoryDistribution[b] - categoryDistribution[a])
        .slice(0, 3);
      
      const marketTrends = [
        { trend: "Handmade pottery seeing 25% growth in market interest", relevance: "High" },
        { trend: "Sustainable materials in high demand", relevance: "Medium" },
        { trend: "Customizable items command 15% price premium", relevance: "High" },
        { trend: "Local artisan markets expanding by 20% annually", relevance: "Medium" },
      ];
      
      const priceComparisons = inventory.map(item => {
        const marketAvg = parseFloat(item.price) * (0.8 + Math.random() * 0.4); // Random market average around the price
        return {
          product: item.name,
          yourPrice: parseFloat(item.price) || 0,
          marketAverage: marketAvg,
          difference: (parseFloat(item.price) || 0) - marketAvg
        };
      });
      
      setMarketData({
        categoryDistribution,
        trendingCategories,
        marketTrends,
        priceComparisons
      });
      
      setMarketLoading(false);
      setShowMarketModal(true);
    }, 800);
  };

  const stats = getInventoryStats();
  const filteredInventory = getFilteredInventory();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavbarArtisan />
      
      {/* Success message toast */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-down">
          {successMessage}
        </div>
      )}
      
      {/* Sales Report Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-[source-code-pro,monospace]">Sales Reports</h2>
              <button 
                onClick={() => setShowSalesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {salesLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Generating sales report...</p>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-[source-code-pro,monospace] font-semibold mb-4">Monthly Sales Overview</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="h-60 w-full">
                      <div className="flex h-full items-end">
                        {salesData.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-4/5 bg-purple-500 hover:bg-purple-600 transition-all rounded-t-md" 
                              style={{ 
                                height: `${(data.sales / Math.max(...salesData.map(d => d.sales))) * 100}%`,
                                minHeight: '10px'
                              }}
                            ></div>
                            <div className="mt-2 text-xs text-gray-600 font-medium">{data.month}</div>
                            <div className="mt-1 text-xs text-gray-500">{data.sales} sold</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-[source-code-pro,monospace] font-semibold mb-4">Revenue Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Month</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Units Sold</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Revenue</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesData.map((data, index) => {
                          const prevRevenue = index > 0 ? salesData[index - 1].revenue : data.revenue;
                          const growth = ((data.revenue - prevRevenue) / (prevRevenue || 1)) * 100;
                          
                          return (
                            <tr key={index}>
                              <td className="py-3 px-4 font-medium">{data.month}</td>
                              <td className="py-3 px-4">{data.sales}</td>
                              <td className="py-3 px-4 font-medium">{formatPrice(data.revenue)}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm mb-4">This is a simulated report based on your current inventory.</p>
                  <button
                    onClick={() => setShowSalesModal(false)}
                    className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Market Insights Modal */}
      {showMarketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-[source-code-pro,monospace]">Market Insights</h2>
              <button 
                onClick={() => setShowMarketModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {marketLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Analyzing market data...</p>
              </div>
            ) : marketData && (
              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Trending Categories */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-[source-code-pro,monospace] font-semibold mb-4">Trending Categories</h3>
                    <ul className="space-y-3">
                      {marketData.trendingCategories.length > 0 ? (
                        marketData.trendingCategories.map((category, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-amber-500 mr-2">{index + 1}.</span>
                            <span className="font-medium">{category}</span>
                            {index === 0 && (
                              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Hot!</span>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No category data available</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Market Trends */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-[source-code-pro,monospace] font-semibold mb-4">Market Trends</h3>
                    <ul className="space-y-3">
                      {marketData.marketTrends.map((trend, index) => (
                        <li key={index} className="flex items-start">
                          <div className={`min-w-[65px] mr-3 px-2 py-1 text-xs rounded-full text-center ${
                            trend.relevance === "High" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {trend.relevance}
                          </div>
                          <span>{trend.trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Price Comparison */}
                <div className="mb-8">
                  <h3 className="text-lg font-[source-code-pro,monospace] font-semibold mb-4">Price Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Product</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Your Price</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Market Average</th>
                          <th className="py-3 px-4 text-left font-[source-code-pro,monospace]">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {marketData.priceComparisons.map((item, index) => (
                          <tr key={index}>
                            <td className="py-3 px-4 font-medium">{item.product}</td>
                            <td className="py-3 px-4">{formatPrice(item.yourPrice)}</td>
                            <td className="py-3 px-4">{formatPrice(item.marketAverage)}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center ${item.difference >= 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {item.difference > 0 ? '+' : ''}{formatPrice(item.difference)}
                                <span className="ml-1 text-xs text-gray-500">
                                  ({((item.difference / item.marketAverage) * 100).toFixed(1)}%)
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm mb-4">This is a simulated market analysis based on your current inventory.</p>
                  <button
                    onClick={() => setShowMarketModal(false)}
                    className="px-5 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-300">
          {/* Profile Header with Background Image */}
          <div className="px-6 py-10 bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-pattern"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold font-[source-code-pro,monospace] mb-2">Artisan Dashboard</h1>
              <p className="text-lg text-white font-[source-code-pro,monospace] flex items-center">
                <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                {user?.username}
              </p>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-300 bg-gray-50">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 font-[source-code-pro,monospace] font-medium transition-all duration-200 ${activeTab === "profile" ? 
                "border-b-2 border-blue-600 text-blue-700 bg-white" : "text-gray-700 hover:text-blue-600"}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab("inventory")}
              className={`py-4 px-6 font-[source-code-pro,monospace] font-medium transition-all duration-200 ${activeTab === "inventory" ? 
                "border-b-2 border-blue-600 text-blue-700 bg-white" : "text-gray-700 hover:text-blue-600"}`}
            >
              Inventory
            </button>
          </div>
          
          {/* Content section */}
          <div className="p-4 md:p-6">
            {activeTab === "profile" && (
              <div className="text-gray-800 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-md transition-transform hover:scale-105">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-[source-code-pro,monospace] text-blue-800">Total Products</h3>
                      <span className="text-2xl opacity-80">🏺</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-sm text-blue-700 mt-2">Items in your portfolio</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-md transition-transform hover:scale-105">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-[source-code-pro,monospace] text-green-800">Approved</h3>
                      <span className="text-2xl opacity-80">✓</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
                    <p className="text-sm text-green-700 mt-2">Products available to buyers</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200 shadow-md transition-transform hover:scale-105">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-[source-code-pro,monospace] text-yellow-800">Pending</h3>
                      <span className="text-2xl opacity-80">⏳</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                    <p className="text-sm text-yellow-700 mt-2">Awaiting approval</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 shadow-md transition-transform hover:scale-105">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-[source-code-pro,monospace] text-orange-800">Low Stock</h3>
                      <span className="text-2xl opacity-80">⚠️</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">{stats.lowStock}</p>
                    <p className="text-sm text-orange-700 mt-2">Items with quantity &lt; 5</p>
                  </div>
                </div>
                
                {/* Account Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-[source-code-pro,monospace] text-gray-800">Account Information</h3>
                      <button 
                        onClick={() => {/* Future functionality to edit profile */}}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                      >
                        Edit Profile
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col p-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm font-[source-code-pro,monospace]">Username</span>
                        <span className="font-medium mt-1 text-gray-900">{user?.username}</span>
                      </div>
                      <div className="flex flex-col p-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm font-[source-code-pro,monospace]">Email</span>
                        <span className="font-medium mt-1 text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex flex-col p-3 border-b border-gray-200">
                        <span className="text-gray-600 text-sm font-[source-code-pro,monospace]">Phone</span>
                        <span className="font-medium mt-1 text-gray-900">{user?.phone}</span>
                      </div>
                      <div className="flex flex-col p-3">
                        <span className="text-gray-600 text-sm font-[source-code-pro,monospace]">Account Type</span>
                        <span className="font-medium mt-1 bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full text-sm">Artisan</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity / Quick Actions */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-[source-code-pro,monospace] mb-4 text-gray-800">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => navigate("/AddProduct")}
                        className="py-4 px-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex flex-col items-center text-center text-blue-800 border border-blue-200"
                      >
                        <span className="text-2xl mb-2">✚</span>
                        <span className="font-[source-code-pro,monospace] text-sm">Add New Product</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab("inventory")}
                        className="py-4 px-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex flex-col items-center text-center text-green-800 border border-green-200"
                      >
                        <span className="text-2xl mb-2">📊</span>
                        <span className="font-[source-code-pro,monospace] text-sm">View Inventory</span>
                      </button>
                      <button 
                        onClick={fetchSalesData}
                        className="py-4 px-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 flex flex-col items-center text-center text-purple-800 border border-purple-200"
                      >
                        <span className="text-2xl mb-2">📝</span>
                        <span className="font-[source-code-pro,monospace] text-sm">Sales Reports</span>
                      </button>
                      <button 
                        onClick={fetchMarketInsights}
                        className="py-4 px-6 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-200 flex flex-col items-center text-center text-amber-800 border border-amber-200"
                      >
                        <span className="text-2xl mb-2">🔍</span>
                        <span className="font-[source-code-pro,monospace] text-sm">Market Insights</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "inventory" && (
              <div className="text-gray-800 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-[source-code-pro,monospace] font-bold text-gray-800">Your Inventory</h2>
                  <button 
                    onClick={() => navigate("/AddProduct")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-[source-code-pro,monospace] transition-colors duration-200 flex items-center text-white"
                  >
                    <span className="mr-2">+</span> Add New Product
                  </button>
                </div>
                
                {/* Filters and Search */}
                <div className="bg-gray-100 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border border-gray-200">
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">🔍</span>
                  </div>
                  
                  {/* Status filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md py-2 px-4 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="lowStock">Low Stock</option>
                  </select>
                  
                  {/* Category filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md py-2 px-4 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  {/* Sort option */}
                  <div className="flex">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-white border border-gray-300 rounded-l-md py-2 px-4 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price">Sort by Price</option>
                      <option value="quantity">Sort by Quantity</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                      className="bg-blue-600 text-white border border-blue-700 rounded-r-md px-3 flex items-center justify-center"
                    >
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-700">Loading inventory...</p>
                  </div>
                ) : filteredInventory.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                    {inventory.length === 0 ? (
                      <>
                        <div className="text-6xl mb-4 opacity-70">🏺</div>
                        <p className="text-gray-600 mb-4">You don't have any products in your inventory yet.</p>
                        <button 
                          onClick={() => navigate("/AddProduct")}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-[source-code-pro,monospace] transition-colors duration-200 text-white"
                        >
                          Add Your First Product
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4 opacity-70">🔍</div>
                        <p className="text-gray-600">No products match your search criteria.</p>
                        <button 
                          onClick={() => {
                            setSearchQuery("");
                            setFilterStatus("all");
                            setFilterCategory("");
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md mt-4 font-[source-code-pro,monospace] transition-colors duration-200 text-white"
                        >
                          Clear Filters
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-gray-600">{filteredInventory.length} item{filteredInventory.length !== 1 ? 's' : ''} found</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInventory.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
                          <div className="h-48 overflow-hidden bg-gray-100 relative group">
                            <img 
                              src={`http://localhost:5000${item.image}`}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button 
                                onClick={() => navigate(`/AddProduct?edit=${item._id}`)}
                                className="bg-blue-600 text-white rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                              >
                                ✏️ Edit
                              </button>
                            </div>
                            {parseInt(item.quantity) < 5 && (
                              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded-md">
                                Low Stock
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                              <span 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.approved 
                                    ? "bg-green-100 text-green-800 border border-green-300" 
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                }`}
                              >
                                {item.approved ? "Approved" : "Pending"}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-1 text-lg font-semibold">{formatPrice(item.price)}</p>
                            
                            <div className="mt-3 flex items-center">
                              <span className="text-sm text-gray-600 mr-2">
                                Quantity:
                              </span>
                              <div className="flex items-center border border-gray-300 rounded">
                                <button 
                                  onClick={() => handleQuantityChange(item._id, parseInt(item.quantity) - 1)}
                                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                                >
                                  -
                                </button>
                                <span className="px-3 text-gray-800">{item.quantity}</span>
                                <button 
                                  onClick={() => handleQuantityChange(item._id, parseInt(item.quantity) + 1)}
                                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-sm text-gray-600 flex items-center">
                              <span className="mr-2">Category:</span>
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                {item.category || "Uncategorized"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add some global styles to index.css
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-in-down {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-in-out;
  }
  
  .animate-fade-in-down {
    animation: fade-in-down 0.4s ease-out;
  }
  
  .bg-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;
document.head.appendChild(style);

export default ArtisanProfile;
