import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import "../style/Navbar.css";

function NavbarArtisan() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogoutClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("user");
    setOpenDialog(false);
    setOpenSnackbar(true);
    setTimeout(() => {
      window.location.href = "/Login";
    }, 1000);
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ background: "#1b2a41" }}>
        <Toolbar className="navbar-toolbar">
          <Typography variant="h6" className="navbar-title" style={{ flexGrow: 1 }}>
            SiniLikhain
          </Typography>
          <Button color="inherit" component={Link} to="/artisan" className="navbar-button">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/AddProduct" className="navbar-button">
            My Products
          </Button>
          <Button color="inherit" component={Link} to="/aboutartisan" className="navbar-button">
            About
          </Button>
          <Button color="inherit" onClick={handleLogoutClick} className="navbar-button">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Dialog open={openDialog} onClose={handleCancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Successfully logged out!
        </Alert>
      </Snackbar>
    </>
  );
}

export default NavbarArtisan;
