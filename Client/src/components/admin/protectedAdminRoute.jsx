// ProtectedAdminRoute — the security checkpoint for all /admin pages
//
// HOW IT WORKS (in plain English):
//   1. Wait until we know if the user is logged in or not (initialized)
//   2. If no user → send them to /login
//   3. If logged in but NOT an admin → send them to the home page
//   4. If ADMIN → let them through (render the admin layout/page)
//
// WHY "initialized"?
//   When the browser refreshes, Redux starts with user = null (empty).
//   App.jsx immediately calls fetchCurrentUser to check the cookie.
//   Without "initialized", this component would see user = null and
//   instantly redirect to /login — even for a valid admin!
//   "initialized" = "has the cookie check finished yet?"

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAdminRoute() {
  // Read the auth state from Redux
  // user       = the logged-in user object (or null if not logged in)
  // initialized = has the cookie check completed? (starts false, becomes true after check)
  const { user, initialized } = useSelector((state) => state.auth);

  // RULE 1: Cookie check not finished yet — show a spinner, don't redirect
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          {/* Spinning circle — pure Tailwind CSS animation */}
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // RULE 2: No user at all → send to login page
  // The "replace" prop means the browser's Back button won't go back to /admin
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RULE 3: Logged in but not an admin → send to home page
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // RULE 4: ✅ All checks passed — render whatever admin page is active
  // <Outlet /> is a "window" that shows the child route (Dashboard, Products, etc.)
  return <Outlet />;
}
