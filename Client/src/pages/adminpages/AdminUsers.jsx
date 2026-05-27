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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c' }}>Users</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9b96b0' }}>
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── USERS TABLE ───────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#181622', border: '1px solid #2a2740' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide" style={{ background: '#0f0e18', color: '#9b96b0' }}>
              <tr>
                <th className="px-5 py-3 text-left font-medium">Full Name</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #2a2740' }}>
              {loading && users.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse" style={{ borderBottom: '1px solid #2a2740' }}>
                    <td className="px-5 py-3"><div className="h-4 w-36 rounded" style={{ background: '#2a2740' }} /></td>
                    <td className="px-5 py-3"><div className="h-4 w-48 rounded" style={{ background: '#2a2740' }} /></td>
                    <td className="px-5 py-3"><div className="h-4 w-24 rounded" style={{ background: '#2a2740' }} /></td>
                    <td className="px-5 py-3"><div className="h-8 w-24 rounded" style={{ background: '#2a2740' }} /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center" style={{ color: '#9b96b0' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  // Is this row the currently logged-in admin?
                  const isSelf = user.id === currentUser?.id;
                  const isAdmin = user.role === 'ADMIN';

                  return (
                    <tr key={user.id} className="transition-colors" style={{ borderBottom: '1px solid #2a2740' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e1b2e'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Full name */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {/* Small avatar circle with first letter of name */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#2a2740' }}>
                            <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                              {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#e8e4f0' }}>{user.fullName}</p>
                            {isSelf && (
                              <p className="text-xs" style={{ color: '#9b96b0' }}>(You)</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3" style={{ color: '#9b96b0' }}>{user.email}</td>

                      {/* Join date */}
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: '#9b96b0' }}>
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
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:opacity-80',
                            isAdmin
                              ? 'bg-[#1a0a2e] text-[#c084fc] border-[#a855f744]'
                              : 'bg-[#1e1b2e] text-[#9b96b0] border-[#2a2740]',
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
