import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddProduct from "./artisan/AddProduct";
import AboutBuyer from "./buyer/AboutBuyer";
import AboutArtisan from "./artisan/AboutArtisan";
import Register from "./pages/Register";
import Admin from "./admin/Admin";
import Buyer from "./buyer/Buyer";
import Artisan from "./artisan/Artisan";
import Cart from "./buyer/Cart";
import RegisterArtisan from "./pages/RegisterArtisan";
import RegisterBuyer from "./pages/RegisterBuyer";
import ArtisanProfile from "./artisan/ArtisanProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/AboutBuyer" element={<AboutBuyer />} />
        <Route path="/AboutArtisan" element={<AboutArtisan />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Buyer" element={<Buyer />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/Artisan" element={<Artisan />} />
        <Route path="/artisanprofile" element={<ArtisanProfile />} />
        <Route path="/registerartisan" element={<RegisterArtisan />} />
        <Route path="/registerbuyer" element={<RegisterBuyer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
