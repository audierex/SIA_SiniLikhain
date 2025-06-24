import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, TextField, Typography, Grid, Box, Dialog, DialogTitle, DialogContent, DialogActions, Fab, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import NavbarArtisan from "./NavbarArtisan";
import Rating from "@mui/material/Rating";
import "../style/AddProduct.css";

function AddProduct() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "", image: null, quantity: 1, category: "" });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [errors, setErrors] = useState({});

  // Get user from localStorage or sessionStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "artisan") {
      navigate("/");
    } else {
      axios.get("http://localhost:5000/products").then((res) => {
        const artisanProducts = res.data.filter(p => p.artisan === user.username);
        setProducts(artisanProducts);
      }).catch(err => {
        console.error("Error fetching products:", err);
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    } else {
      setPreview(null);
    }
  };

  const validateForm = () => {
    let currentErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      currentErrors.name = "Product name is required.";
      isValid = false;
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      currentErrors.price = "Price must be a positive number.";
      isValid = false;
    }

    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      currentErrors.quantity = "Quantity must be a positive integer.";
      isValid = false;
    }

    if (!formData.category.trim()) {
      currentErrors.category = "Category is required.";
      isValid = false;
    }

    if (!editId && !formData.image) {
      currentErrors.image = "Product image is required.";
      isValid = false;
    }

    setErrors(currentErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("artisan", user.username);
    if (formData.image) data.append("image", formData.image);
    data.append("quantity", formData.quantity);
    data.append("category", formData.category);

    try {
      if (editId) {
        const res = await axios.put(`http://localhost:5000/products/${editId}`, data);
        setProducts((prev) =>
          prev.map((p) => (p._id === editId ? res.data : p))
        );
        alert("Product updated successfully!");
      } else {
        const res = await axios.post("http://localhost:5000/products", data);
        setProducts((prev) => [...prev, res.data]);
        alert("Product added successfully!");
      }
      setEditId(null);
      setFormData({ name: "", price: "", image: null, quantity: 1, category: "" });
      setPreview(null);
      setOpenForm(false);
      setErrors({});
    } catch (err) {
      console.error("Error submitting product:", err);
      alert("Error saving product. Please try again.");
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      image: null,
      quantity: product.quantity || 1,
      category: product.category || "",
    });
    setPreview(product.image ? `http://localhost:5000${product.image}` : null);
    setOpenForm(true);
    setSelectedProduct(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/products/${id}`);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        if (editId === id) {
          setEditId(null);
          setFormData({ name: "", price: "", image: null, quantity: 1, category: "" });
          setPreview(null);
          setOpenForm(false);
        }
        setSelectedProduct(null);
        alert("Product deleted successfully!");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ name: "", price: "", image: null, quantity: 1, category: "" });
    setPreview(null);
    setOpenForm(true);
    setErrors({});
  };

  const handleCloseForm = () => {
    setEditId(null);
    setFormData({ name: "", price: "", image: null, quantity: 1, category: "" });
    setPreview(null);
    setOpenForm(false);
    setErrors({});
  };

  return (
    <>
      <NavbarArtisan />
      <Box className="addproduct-main" p={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" className="addproduct-title">
            My Products
          </Typography>
          <Box display="flex" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className="addproduct-add-btn"
              onClick={handleOpenAdd}
              sx={{ boxShadow: "none", textTransform: "none" }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        <Dialog open={openForm} onClose={handleCloseForm} maxWidth="xs" fullWidth>
          <DialogTitle>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              className="addproduct-input"
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              className="addproduct-input"
              margin="normal"
              error={!!errors.price}
              helperText={errors.price}
            />
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              className="addproduct-input"
              margin="normal"
              inputProps={{ min: 1 }}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              className="addproduct-input"
              margin="normal"
              sx={{ marginTop: 2 }}
              error={!!errors.category}
              helperText={errors.category}
            >
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="Accessories">Accessories</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Home Decor">Home Decor</MenuItem>
              <MenuItem value="Art">Art</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="addproduct-file-input"
              style={{ marginTop: '16px' }}
            />
            {!!errors.image && (
              <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                {errors.image}
              </Typography>
            )}
            {preview && (
              <img src={preview} alt="Preview" className="addproduct-preview-img" style={{ marginTop: '16px', maxWidth: '100%', height: 'auto' }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              className="addproduct-submit-btn"
              onClick={handleSubmit}
            >
              {editId ? "Update" : "Submit"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              className="addproduct-cancel-btn"
              onClick={handleCloseForm}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={2} className="addproduct-grid-container">
          {products.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
              You have no products yet. Click "Add Product" to get started!
            </Typography>
          ) : (
            products.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id} className="addproduct-grid-item">
                <Box
                  className="addproduct-product-box"
                  border={1}
                  borderRadius={2}
                  p={2}
                  onClick={() => setSelectedProduct(p)}
                >
                  <img
                    src={`http://localhost:5000${p.image}`}
                    alt={p.name}
                    className="addproduct-product-img"
                  />
                  <Typography className="addproduct-product-name">{p.name}</Typography>
                  <Typography className="addproduct-product-price">₱{p.price}</Typography>
                  <Typography className="addproduct-product-qty">Qty: {p.quantity}</Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>

        <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Product Details</DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            {selectedProduct && (
              <>
                <img
                  src={`http://localhost:5000${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  className="addproduct-product-img"
                  style={{ marginBottom: 16 }}
                />
                <Typography variant="h6">{selectedProduct.name}</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>₱{selectedProduct.price}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Quantity: {selectedProduct.quantity}</Typography>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Rating
                    name="product-rating"
                    value={
                      selectedProduct.ratings && selectedProduct.ratings.length
                        ? selectedProduct.ratings.reduce((sum, r) => sum + r.value, 0) / selectedProduct.ratings.length
                        : 0
                    }
                    precision={0.5}
                    readOnly
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({selectedProduct.ratings ? selectedProduct.ratings.length : 0})
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleEdit(selectedProduct)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDelete(selectedProduct._id)}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default AddProduct;
