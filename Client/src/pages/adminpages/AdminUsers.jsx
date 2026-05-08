// AdminUsers — view all registered users and manage their roles
//
// WHAT THIS PAGE DOES:
//   - Shows a table of every registered user
//   - Each row has a role button: clicking it toggles ADMIN ↔ USER
//   - Your own row has a disabled button (can't demote yourself)
//
// DATA FLOW:
//   On mount: dispatch(fetchAdminUsers) → reads state.admin.users
//   Toggle:   dispatch(changeUserRole({ id, role }))
//             → adminSlice.changeUserRole.fulfilled updates that one user in the array
//             → React re-renders the button with the new role colour

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, changeUserRole } from '@/store/adminSlice';
import toast from 'react-hot-toast';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

export default function AdminUsers() {
  const dispatch = useDispatch();

  // state.admin.users = array of all registered users
  const { users, loading } = useSelector((state) => state.admin);

  // state.auth.user = the currently logged-in admin
  // We need this so we can disable the role button on the admin's own row
  const currentUser = useSelector((state) => state.auth.user);

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Called when admin clicks the role button on a row
  // user = the user whose role we're changing
  const handleRoleToggle = async (user) => {
    // Toggle the role: if ADMIN → make USER, if USER → make ADMIN
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    try {
      const result = await dispatch(changeUserRole({ id: user.id, role: newRole }));

      if (changeUserRole.fulfilled.match(result)) {
        toast.success(`${user.fullName} is now ${newRole}`);
      } else {
        toast.error(result.payload || 'Role update failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── USERS TABLE ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Full Name</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-8 w-24 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  // Is this row the currently logged-in admin?
                  const isSelf = user.id === currentUser?.id;
                  const isAdmin = user.role === 'ADMIN';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* Full name */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {/* Small avatar circle with first letter of name */}
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-zinc-600">
                              {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.fullName}</p>
                            {isSelf && (
                              <p className="text-xs text-zinc-400">(You)</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 text-gray-500">{user.email}</td>

                      {/* Join date */}
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-KE', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>

                      {/* Role toggle button
                          - ADMIN = purple background (prominent, high-trust)
                          - USER  = grey background  (standard)
                          - isSelf = disabled (can't change your own role)
                          Clicking switches to the OPPOSITE role */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleRoleToggle(user)}
                          disabled={isSelf}
                          title={isSelf ? "You can't change your own role" : `Click to make ${isAdmin ? 'USER' : 'ADMIN'}`}
                          className={[
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                            'transition-colors border',
                            isSelf
                              ? 'opacity-50 cursor-not-allowed'       // disabled state
                              : 'cursor-pointer hover:opacity-80',    // clickable state
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 border-purple-200'  // ADMIN style
                              : 'bg-gray-100   text-gray-700   border-gray-200',   // USER style
                          ].join(' ')}
                        >
                          {isAdmin
                            ? <><ShieldCheck className="w-3 h-3" /> ADMIN</>
                            : <><UserIcon    className="w-3 h-3" /> USER</>
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
