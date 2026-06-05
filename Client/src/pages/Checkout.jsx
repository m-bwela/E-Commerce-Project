import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '@/store/cartSlice';
import { createOrderAPI } from '@/api/orders';
import toast from 'react-hot-toast';

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [placed, setPlaced] = useState(false);

    // Guard: empty cart or not logged in should never see this page
    const items = cart?.items ?? [];
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone.trim()) { setError('Phone number is required'); return }
        setError(null);
        setLoading(true);
        try {
            await createOrderAPI(phone); // Backend will read the cart from the cookie, so we don't need to send the cart data here
            dispatch(clearCart()); // Clear the cart in Redux after successful order creation
            setPlaced(true);
            toast.success('Order placed successfully!');
            setTimeout(() => navigate('/products'), 3000); // Redirect after 3 seconds
        } catch (err) {
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="mb-4" style={{ color: '#9b96b0' }}>Your cart is empty.</p>
                <Link to="/products" className="px-6 py-2 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}>
                    Continue Shopping
                </Link>
            </div>
        )
    }

    // Success screen - shown after order is placed
    if (placed) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="mx-auto max-w-md p-8 rounded-2xl" style={{ background: '#181622', border: '1px solid #2a2740' }}>
                    <div className="text-5xl mb-4">
                        🎉
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c' }}>
                        Order Placed Successfully!
                    </h2>
                    <p className="mb-6" style={{ color: '#9b96b0' }}>
                        Thank you, {user?.fullName} for your purchase! We'll confirm via <span style={{ color: '#e8e4f0' }}>{phone}</span>. 
                    </p>
                    <Link to="/products" className="px-6 py-2 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}>
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
    <div className="container mx-auto px-4 py-8">
        {/* Page Heading */}
        <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c' }}>
            Checkout
        </h1>

    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

        {/* LEFT — Contact Information */}
        <div className="flex-1 space-y-5">
            <div className="p-6 rounded-2xl space-y-4" style={{ background: '#181622', border: '1px solid #2a2740' }}>
                <h2 className="text-lg font-semibold" style={{ color: '#e8e4f0' }}>Contact Information</h2>

                {/* Full name - read-only from redux */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#9b96b0' }}>Full Name</label>
                    <input 
                        type="text"
                        value={user?.fullName || ''}
                        readOnly
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ background: '#0f0e18', border: '1px solid #2a2740', color: '#9b96b0', cursor: 'not-allowed' }}
                    />
                </div>

                {/* Email - read-only from redux */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#9b96b0' }}>Email</label>
                    <input 
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ background: '#0f0e18', border: '1px solid #2a2740', color: '#9b96b0', cursor: 'not-allowed' }}
                    />
                </div>

                {/* Phone number - user types this */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#9b96b0' }}>Phone Number
                        <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712 345 678"
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ background: '#0f0e18', border: '1px solid #2a2740', color: '#9b96b0' }}
                    />
                </div>

                {/* Error message */}
                {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
            </div>

        {/* Submit button */}
        <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a)', color: '#1a1400', boxShadow: '0 4px 20px #c9a84c44' }}
        >
            {loading ? 'Placing Order...' : 'Place Order'}
        </button>
        </div>

        {/* RIGHT — Order summary */}
        <div className="w-full lg:w-80 h-fit p-6 rounded-2xl space-y-3" style={{ background: '#181622', border: '1px solid #2a2740' }}>
            <h2 className='text-lg font-semibold mb-2' style={{ fontFamily: "'Playfair Display', serif", color: '#e8e4f0' }}>
                Order Summary
            </h2>

            {items.map((item) => (
                <div key={item.id} className='flex items-center gap-3 py-2' style={{ borderBottom: '1px solid #2a2740' }}>
                    <img 
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className='w-12 h-12 object-cover rounded-lg flex-shrink-0'
                        style={{ border: '1px solid #2a2740' }}
                    />
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate' style={{ color: '#e8e4f0' }}>{item.product.name}</p>
                        <p className='text-xs' style={{ color: '#9b96b0' }}>Qty: {item.quantity}</p>
                    </div>
                    <p className='text-sm font-semibold flex-shrink-0' style={{ color: '#c9a84c' }}>
                        Ksh {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center pt-2">
                <span className="font-bold" style={{ color: '#e8e4f0' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: '#c9a84c' }}>
                      KSh {total.toLocaleString()}
                </span>
            </div>
        </div>

    </form>
    </div>
  );
}