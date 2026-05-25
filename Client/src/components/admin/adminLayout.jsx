// AdminLayout — the persistent sidebar wrapper for all admin pages
//
// ANALOGY: Think of this like a TV remote.
//   The remote (sidebar) stays the same.
//   The channel you're watching (<Outlet />) changes.
//
// STRUCTURE:
//   <div class="flex">
//     <aside>  ← LEFT: sidebar (fixed width, always visible)
//       Logo, nav links, user info, logout
//     </aside>
//     <main>   ← RIGHT: content area (stretches to fill remaining space)
//       <Outlet /> ← whichever admin page is active shows here
//     </main>
//   </div>
//
// NavLink vs Link:
//   <Link>    just navigates
//   <NavLink> navigates AND knows if it's the "current" page
//             so we can highlight the active menu item automatically

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/authSlice";
import {
  LayoutDashboard, // 📊 icon
  Package,         // 📦 icon
  ShoppingCart,    // 🛒 icon
  Users,           // 👥 icon
  LogOut,          // 🚪 icon
  Store,           // 🏪 icon
} from "lucide-react";

// The nav links data — one object per sidebar item
// Using an array like this means we can add new pages by just adding one line here
const NAV_LINKS = [
  { to: "/admin",          label: "Dashboard", icon: LayoutDashboard, end: true  },
  //                                                                    ↑
  //                       end=true means ONLY highlight when URL is exactly /admin
  //                       Without it, /admin/products would ALSO highlight Dashboard
  //                       because it starts with /admin
  { to: "/admin/products", label: "Products",  icon: Package,         end: false },
  { to: "/admin/orders",   label: "Orders",    icon: ShoppingCart,    end: false },
  { to: "/admin/users",    label: "Users",     icon: Users,           end: false },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Read the logged-in user's name and email from Redux to show at the bottom of the sidebar
  const user = useSelector((state) => state.auth.user);

  // When admin clicks Logout:
  //   1. Call the backend to clear the cookie (dispatches logoutUser thunk)
  //   2. Redirect to login page
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    // Outer wrapper — full screen height, side-by-side layout (flex row)
    <div className="min-h-screen flex">

      {/* ── SIDEBAR (LEFT) ─────────────────────────────────────────────── */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col flex-shrink-0">

        {/* Logo area at the top */}
        <div className="px-6 py-5 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-zinc-300" />
            <div>
              <p className="font-bold text-white leading-tight">GenZiiShop</p>
              <p className="text-xs text-zinc-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        {/* flex-1 makes this section grow to push user info to the bottom */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              // className receives { isActive } from React Router
              // isActive = true when this link matches the current URL
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-700 text-white"          // ← highlighted (active page)
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white", // ← normal
                ].join(" ")
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout at the bottom of the sidebar */}
        <div className="px-4 py-4 border-t border-zinc-700">
          {user && (
            <div className="mb-3">
              {/* First line: full name, truncated if too long */}
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              {/* Second line: email, smaller and dimmer */}
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400
                       hover:bg-zinc-800 hover:text-white rounded-lg transition-colors mb-1"
          >
            <Store className="w-4 h-4" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400
                       hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── CONTENT AREA (RIGHT) ───────────────────────────────────────── */}
      {/* flex-1 = "take all remaining horizontal space" */}
      {/* overflow-auto = allows this area to scroll if content is tall */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {/* <Outlet /> is where React Router renders the active child page:
            /admin          → Dashboard
            /admin/products → AdminProducts
            /admin/orders   → AdminOrders
            /admin/users    → AdminUsers  */}
        <Outlet />
      </main>

    </div>
  );
}
