import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getOrdersAPI } from '@/api/orders';

// Badge colour per status - same as Admin's order management page
const STATUS_STYLES = {
    PENDING:  'bg-[#2a2200] text-[#e8c96a] border border-[#c9a84c44]',
    PAID:   'bg-[#0a1f2e] text-[#60a5fa] border border-[#3b82f644]',
    SHIPPED:'bg-[#1a0a2e] text-[#c084fc] border border-[#a855f744]',
    DELIVERED:'bg-[#0a1f15] text-[#4ade80] border border-[#22c55e44]',
    CANCELLED:'bg-[#2a0a0a] text-[#f87171] border border-[#ef444444]',
};

export default function OrderHistory() {
    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getOrdersAPI()
            .then((res) => setOrders(res.data))
            .catch(() => setError('Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    // Not logged in (shouldn't happen due to route protection, but just in case)
    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="mb-4" style={{ color: '#9b96b0' }}>Please log in to view your order history.</p>
                <Link to="/login" className="px-6 py-2 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}>
                    Log In
                </Link>
            </div>
        );
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-4 animate-pulse">
                <div className="h-8 w-48 rounded" style={{ backgrounde: '#2a2740' }} />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 rounded-xl" style={{ background: '#181622', border: '1px solid #2a2740' }} />
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="conatainer mx-auto px-4 py-8">
                <p className="p-4 rounded-xl" style={{ background: '#2a0a0a', color: '#f87171', border: '1px solid #4a1a1a' }}>
                    {error}
                </p>
            </div>
        );
    }

    // Empty state
    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="mb-4 text-lg" style={{ color: '#9b96b0' }}>You have no orders yet.</p>
                <Link to="/products" className="px-6 py-2 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c' }}>
                Your Orders
            </h1>

            {orders.map((order) => (
                <div key={order.id} className="rounded-xl p-5"
                    style={{ background: '#181622', border: '1px solid #2a2740' }}>

                        {/* Order headeer row*/}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4"
                            style={{ borderBottom: '1px solid #2a2740', paddingBottom: '0.75rem' }}>
                                <div>
                                    <p className='text-xs' style={{ color: '#9b96b0' }}>Order ID</p>
                                    <p className="text-xs font-mono" style={{ color: '#e8e4f0' }}>{order.id}</p>
                                </div>
                                <div>
                                    <p className='text-xs' style={{ color: '#9b96b0' }}>Date</p>
                                    <p className='text-sm' style={{ color: '#e8e4f0' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-KE', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-xs' style={{ color: '#9b96b0' }}>Total</p>
                                    <p className='text-sm font-bold' style={{ color: '#c9a84c' }}>
                                        KSh {Number(order.total).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || ''}`}>
                                    {order.status}
                                </span>
                        </div>

                        {/* Items list */}
                        <div className='space-y-2'>
                            {order.items.map((item) => (
                                <div key={item.id} className='flex items-center gap-3'>
                                    <img 
                                        src={item.product?.image}
                                        alt={item.product?.name}
                                        className='w-10 h-10 object-cover rounded-lg flex-shrink-0'
                                        style={{ border: '1px solid #2a2740' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm truncate' style={{ color: '#e8e4f0' }}>{item.product?.name}</p>
                                        <p className='text-xs' style={{ color: '#9b96b0' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p className='text-sm font-medium flex-shrink-0' style={{ color: '#c9a84c' }}>
                                        KSh {Number(item.price * item.quantity).toLocaleString('en-KE')}
                                    </p>
                                </div>
                            ))}
                        </div>
                </div>
            ))}
        </div>
    );
}