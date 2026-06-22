import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { I18nProvider } from "./context/I18nContext";

import { Layout } from "./components/storefront/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Account from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import StaticPage from "./pages/StaticPage";

import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import { ADMIN_BASE, ADMIN_LOGIN } from "./lib/routes";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminImport from "./admin/AdminImport";
import AdminCategories from "./admin/AdminCategories";
import AdminBrands from "./admin/AdminBrands";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminPincodes from "./admin/AdminPincodes";
import AdminBlog from "./admin/AdminBlog";
import AdminSettings from "./admin/AdminSettings";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
            <CartProvider>
              <Toaster position="top-center" richColors />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success/:id" element={<OrderSuccess />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/orders/:id" element={<OrderDetail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/page/:slug" element={<StaticPage />} />
                </Route>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path={ADMIN_LOGIN} element={<AdminLogin />} />

                <Route path={ADMIN_BASE} element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="import" element={<AdminImport />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="pincodes" element={<AdminPincodes />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </CartProvider>
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
