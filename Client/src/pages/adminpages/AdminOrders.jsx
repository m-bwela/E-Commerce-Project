// AdminOrders — view and manage all customer orders
//
// WHAT THIS PAGE DOES:
//   - Shows every order in the system (newest first from the API)
//   - Each row has a status dropdown — admin can change the status
//   - When status changes: PATCH /api/admin/orders/:id/status
//     → adminSlice updates that order in Redux
//     → React re-renders the dropdown to show the new status
//
// STATUS LIFECYCLE:
//   PENDING → PAID → SHIPPED → DELIVERED
//                  ↘ CANCELLED (at any stage)

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, changeOrderStatus } from '@/store/adminSlice';
import toast from 'react-hot-toast';

// All valid status options (matches the Prisma OrderStatus enum exactly)
const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Colour classes for each status — applied to the <select> dropdown
// so the admin can see at a glance what state each order is in
const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID:      'bg-blue-100   text-blue-800   border-blue-200',
  SHIPPED:   'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100  text-green-800  border-green-200',
  CANCELLED: 'bg-red-100    text-red-800    border-red-200',
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.admin);

  // Fetch all orders when the page loads
  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Called when the admin picks a new status from the dropdown
  // orderId = the order to update
  // newStatus = the new value chosen from the dropdown (e.g. "SHIPPED")
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // dispatch returns a promise — we await it to check if it succeeded
      const result = await dispatch(changeOrderStatus({ id: orderId, status: newStatus }));

      // Redux Toolkit's unwrapResult pattern:
      // If the thunk rejected (API error), .payload is the error message
      // We check the action type to decide if it succeeded
      if (changeOrderStatus.fulfilled.match(result)) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(result.payload || 'Update failed');
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
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── ORDERS TABLE ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total (KSh)</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-20 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-8 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer info */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{order.user?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>

                    {/* Items list — product names joined by commas, truncated if long */}
                    <td className="px-5 py-3 text-gray-600 max-w-xs">
                      <p className="truncate">
                        {order.items?.map((item) => {
                          const name = item.product?.name || 'Item';
                          return item.quantity > 1 ? `${name} ×${item.quantity}` : name;
                        }).join(', ') || '—'}
                      </p>
                    </td>

                    {/* Order total */}
                    <td className="px-5 py-3 text-right font-medium text-gray-800">
                      {Number(order.total).toLocaleString()}
                    </td>

                    {/* Order date */}
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>

                    {/* Status dropdown
                        - The colour changes based on the current status
                        - onChange immediately dispatches to Redux + calls the API */}
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer
                                    focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors
                                    ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
