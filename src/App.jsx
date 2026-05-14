import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Contact from './components/Contact';
import Login from './components/Login';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Profile from './admin/Profile';
import Products from './admin/Products';
import Category from './admin/Category';
import Messagerie from './admin/Messagerie';
import CouponCode from './admin/CouponCode';
import AdminOffer from './admin/AdminOffer';
import AdminInventory from './admin/AdminInventory';
import Arab from './components/Arab';
import Niche from './components/Niche';
import Designer from './components/Designer';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Layout (using children pattern) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/arab" element={<Layout><Arab /></Layout>} />
        <Route path="/niche" element={<Layout><Niche /></Layout>} />
        <Route path="/designer" element={<Layout><Designer /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />


        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes - nested under AdminLayout (using Outlet pattern) */}
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Category />} />
          <Route path="messagerie" element={<Messagerie />} />
          <Route path="discounts" element={<CouponCode />} />
          <Route path="offers" element={<AdminOffer />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;