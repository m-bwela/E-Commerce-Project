import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { fetchCurrentUser } from './store/authSlice'

// ── Regular page imports ───────────────────────────────────────────────────
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import NotFound from '@/NotFoundPage/NotFound'

// ── Admin infrastructure imports ───────────────────────────────────────────
// ProtectedAdminRoute = the security checkpoint (checks if user is ADMIN)
// AdminLayout         = the sidebar wrapper shown on all admin pages
import ProtectedAdminRoute from '@/components/admin/protectedAdminRoute'
import AdminLayout from '@/components/admin/adminLayout'

// ── Admin page imports ─────────────────────────────────────────────────────
import Dashboard from '@/pages/adminpages/Dashboard'
import AdminProducts from '@/pages/adminpages/AdminProducts'
import AdminOrders from '@/pages/adminpages/AdminOrders'
import AdminUsers from '@/pages/adminpages/AdminUsers'

// AppLayout = the wrapper for ALL normal (non-admin) pages
// It provides the Navbar at the top and Footer at the bottom
// Admin pages intentionally do NOT use this — they use AdminLayout instead
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const dispatch = useDispatch()

  // When the app first loads (or user refreshes the page),
  // check if there's a valid login cookie.
  // If yes → Redux stores the user data → Navbar shows "Hi, John"
  // If no  → nothing happens, user stays as guest
  // This also sets "initialized = true" in authSlice when it finishes,
  // which is what ProtectedAdminRoute waits for before running its checks.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <>
      <Routes>
        {/* Public pages (no layout wrapper needed) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Admin routes ────────────────────────────────────────────────
            Level 1: ProtectedAdminRoute
              → Checks: initialized? logged in? role=ADMIN?
              → Its <Outlet /> renders Level 2

            Level 2: AdminLayout
              → Shows the sidebar
              → Its <Outlet /> renders Level 3 (the actual page)

            Level 3: The individual admin pages
              Each path maps to one component

            HOW IT FLOWS when you visit /admin/products:
              1. ProtectedAdminRoute runs its security checks
              2. AdminLayout renders the sidebar
              3. AdminProducts fills the content area
        ──────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* All other pages — AppLayout adds Navbar + Footer automatically */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>

      {/* Toast notifications — shows pop-up messages like "Product deleted!" */}
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  )
}

export default App
