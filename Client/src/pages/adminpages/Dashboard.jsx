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
    PENDING:   'bg-[#2a2200] text-[#e8c96a] border border-[#c9a84c44]',
    PAID:      'bg-[#0a1f2e] text-[#60a5fa] border border-[#3b82f644]',
    SHIPPED:   'bg-[#1a0a2e] text-[#c084fc] border border-[#a855f744]',
    DELIVERED: 'bg-[#0a1f15] text-[#4ade80] border border-[#22c55e44]',
    CANCELLED: 'bg-[#2a0a0a] text-[#f87171] border border-[#ef444444]',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-[#1e1b2e] text-[#9b96b0]'}`}>
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
    color: 'bg-[#0a1f15] text-[#4ade80]',
    // Format the number as "KSh 12,450.00"
    format: (v) => `KSh ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
  },
  {
    title: 'Total Orders',
    key: 'totalOrders',
    icon: ShoppingCart,
    color: 'bg-[#0a1f2e] text-[#60a5fa]',
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    title: 'Total Products',
    key: 'totalProducts',
    icon: Package,
    color: 'bg-[#1a0a2e] text-[#c084fc]',
    format: (v) => Number(v || 0).toLocaleString(),
  },
  {
    title: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    color: 'bg-[#2a1500] text-[#fb923c]',
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
        <div className="h-8 w-48 rounded" style={{ background: '#2a2740' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 h-28" style={{ background: '#181622', border: '1px solid #2a2740' }} />
          ))}
        </div>
        <div className="rounded-xl p-5 space-y-3" style={{ background: '#181622', border: '1px solid #2a2740' }}>
          <div className="h-6 w-40 rounded" style={{ background: '#2a2740' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded" style={{ background: '#1e1b2e' }} />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4" style={{ background: '#2a0a0a', border: '1px solid #4a1a1a', color: '#f87171' }}>
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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#9b96b0' }}>
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── STAT CARDS GRID ─────────────────────────────────────────────── */}
      {/* 1 column on mobile, 2 columns on tablet, 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, key, icon: Icon, color, format }) => (
          <div key={key} className="rounded-xl p-5 flex items-center gap-4" style={{ background: '#181622', border: '1px solid #2a2740' }}>
            {/* Coloured icon circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            {/* Title + value */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#9b96b0' }}>{title}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#e8e4f0' }}>
                {stats ? format(stats[key]) : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECENT ORDERS TABLE ─────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#181622', border: '1px solid #2a2740' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2740' }}>
          <h2 className="text-base font-semibold" style={{ color: '#e8e4f0' }}>Recent Orders</h2>
          <p className="text-xs mt-0.5" style={{ color: '#9b96b0' }}>Last 5 orders placed</p>
        </div>

        {/* Table is wrapped in overflow-x-auto so it scrolls horizontally on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide" style={{ background: '#0f0e18', color: '#9b96b0' }}>
              <tr>
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Items</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #2a2740' }}>
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors" style={{ borderBottom: '1px solid #2a2740' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e1b2e'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Customer name + email */}
                    <td className="px-5 py-3">
                      <p className="font-medium" style={{ color: '#e8e4f0' }}>{order.user?.fullName || 'Unknown'}</p>
                      <p className="text-xs" style={{ color: '#9b96b0' }}>{order.user?.email}</p>
                    </td>
                    {/* Items: join all product names with a comma */}
                    <td className="px-5 py-3 max-w-xs truncate" style={{ color: '#9b96b0' }}>
                      {order.items?.map((item) => item.product?.name).join(', ') || '—'}
                    </td>
                    {/* Total price */}
                    <td className="px-5 py-3 text-right font-medium" style={{ color: '#c9a84c' }}>
                      KSh {Number(order.total).toLocaleString()}
                    </td>
                    {/* Status badge */}
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    {/* Date formatted as "May 8, 2026" */}
                    <td className="px-5 py-3" style={{ color: '#9b96b0' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state — no orders yet
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center" style={{ color: '#9b96b0' }}>
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
