// Dashboard — admin home page showing store overview stats
//
// DATA FLOW:
//   1. Component mounts (appears on screen for the first time)
//   2. dispatch(fetchAdminStats) sends GET /api/admin/stats to the backend
//   3. Backend queries the database and returns:
//      { totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders }
//   4. adminSlice stores this in Redux: state.admin.stats = { ... }
//   5. useSelector reads it and we render the stat cards + table
//
// LOADING STATE:
//   While waiting, we show "skeleton" boxes — grey pulsing shapes
//   that look like loading placeholders (better than a blank screen)

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '@/store/adminSlice';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

// ── StatusBadge helper ──────────────────────────────────────────────────────
// A tiny component that takes a status string and shows a coloured pill badge
// Used both here (Dashboard recent orders) and in AdminOrders
//
// STATUS   → COLOUR
// PENDING  → yellow
// PAID     → blue
// SHIPPED  → purple
// DELIVERED→ green
// CANCELLED→ red
export function StatusBadge({ status }) {
  const styles = {
    PENDING:   'bg-yellow-100 text-yellow-800',
    PAID:      'bg-blue-100   text-blue-800',
    SHIPPED:   'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100  text-green-800',
    CANCELLED: 'bg-red-100    text-red-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

// ── Stat card data ────────────────────────────────────────────────────────
// Each card has: a title, an icon, a colour, and a function to format the value
// The value comes from the stats object returned by the API
const STAT_CARDS = [
  {
    title: 'Total Revenue',
    key: 'totalRevenue',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    // Format the number as "KSh 12,450.00"
    format: (v) => `KSh ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
  },
  {
    title: 'Total Orders',
    key: 'totalOrders',
    icon: ShoppingCart,
    color: 'bg-blue-100 text-blue-600',
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    title: 'Total Products',
    key: 'totalProducts',
    icon: Package,
    color: 'bg-purple-100 text-purple-600',
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    title: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
    format: (v) => Number(v || 0).toLocaleString(),
  },
];

export default function Dashboard() {
  const dispatch = useDispatch();

  // Read from Redux state
  const { stats, loading, error } = useSelector((state) => state.admin);

  // On mount: fetch the stats from the backend
  // The empty [] means "run this once when the component first appears"
  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  // ── LOADING STATE ────────────────────────────────────────────────────────
  // Show pulsing grey skeleton boxes while the API call is in flight
  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        {/* Skeleton heading */}
        <div className="h-8 w-48 bg-gray-200 rounded" />
        {/* Skeleton stat cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-28 shadow-sm" />
          ))}
        </div>
        {/* Skeleton table rows */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <strong>Error loading stats:</strong> {error}
        </div>
      </div>
    );
  }

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── STAT CARDS GRID ─────────────────────────────────────────────── */}
      {/* 1 column on mobile, 2 columns on tablet, 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, key, icon: Icon, color, format }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            {/* Coloured icon circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            {/* Title + value */}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {stats ? format(stats[key]) : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECENT ORDERS TABLE ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 5 orders placed</p>
        </div>

        {/* Table is wrapped in overflow-x-auto so it scrolls horizontally on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer name + email */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{order.user?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    {/* Items: join all product names with a comma */}
                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">
                      {order.items?.map((item) => item.product?.name).join(', ') || '—'}
                    </td>
                    {/* Total price */}
                    <td className="px-5 py-3 text-right font-medium text-gray-800">
                      KSh {Number(order.total).toLocaleString()}
                    </td>
                    {/* Status badge */}
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    {/* Date formatted as "May 8, 2026" */}
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state — no orders yet
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
