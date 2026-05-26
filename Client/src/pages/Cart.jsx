import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "@/store/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading} = useSelector(state => state.cart);
  const { user } = useSelector(state =>state.auth);
  
  const subtotal = cart?.items?.reduce(
    (total, item) => total + item.product.price * item.quantity, 0
    ) ?? 0;

    useEffect(() => {
      if (user) dispatch(fetchCart());
    }, [user]);


    return (
    <div className="container mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}
        >Shopping Cart</h1>

        {/* BRANCH 1 — Not logged in */}
        {!user && (
            <div className="text-center py-16">
                <p className="mb-4" style={{ color: '#9b96b0' }}>Please log in to view your cart.</p>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-lg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}
                >
                    Log In
                </Link>
            </div>
        )}

        {/* BRANCH 2 — Loading */}
        {user && loading && (
            <p style={{ color: '#9b96b0' }}>Loading cart...</p>
        )}

        {/* BRANCH 3 — Empty cart */}
        {user && !loading && (!cart || cart.items.length === 0) && (
            <div className="text-center py-16">
                <p className="mb-4" style={{ color: '#9b96b0' }}>Your cart is empty.</p>
                <Link
                  to="/products"
                  className="px-6 py-2 rounded-lg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }}
                >
                    Browse Products
                </Link>
            </div>
        )}

        {/* BRANCH 4 — Has items */}
        {user && !loading && cart && cart.items.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT — Cart items */}
                <div className="flex-1">
                    {cart.items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 py-4"
                          style={{ borderBottom: '1px solid #2a2740' }}
                        >
                            <img
                                src={`${item.product.imageUrl}`}
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                                style={{ border: '1px solid #2a2740' }}
                            />
                            <div className="flex-1">
                                <p className="font-semibold" style={{ color: '#e8e4f0' }}>{item.product.name}</p>
                                <p style={{ color: '#c9a84c', fontWeight: 600 }}>KSh {item.product.price.toLocaleString()}</p>
                            </div>

                            {/* Qty controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (item.quantity === 1) {
                                            dispatch(removeCartItem(item.id));
                                        } else {
                                            dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }));
                                        }
                                    }}
                                    className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                    style={{ border: '1px solid #2a2740', color: '#e8e4f0', background: '#16141f' }}
                                >
                                    −
                                </button>
                                <span className="w-6 text-center" style={{ color: '#e8e4f0' }}>{item.quantity}</span>
                                <button
                                    onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                                    className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                    style={{ border: '1px solid #2a2740', color: '#e8e4f0', background: '#16141f' }}
                                >
                                    +
                                </button>
                            </div>

                            <p className="w-24 text-right font-semibold" style={{ color: '#c9a84c' }}>
                                KSh {(item.product.price * item.quantity).toLocaleString()}
                            </p>

                            <button
                                onClick={() => dispatch(removeCartItem(item.id))}
                                className="ml-2 transition-colors"
                                style={{ color: '#e05555' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* RIGHT — Order summary */}
                <div
                  className="w-full lg:w-80 p-6 h-fit rounded-xl"
                  style={{ border: '1px solid #2a2740', background: '#181622' }}
                >
                    <h2
                      className="text-lg font-bold mb-4"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}
                    >Order Summary</h2>
                    <div className="flex justify-between mb-2" style={{ color: '#9b96b0' }}>
                        <span>Subtotal</span>
                        <span style={{ color: '#e8e4f0' }}>KSh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-4" style={{ color: '#9b96b0' }}>
                        <span>Shipping</span>
                        <span style={{ color: '#5edc8e' }}>Free</span>
                    </div>
                    <div
                      className="flex justify-between font-bold text-lg pt-4 mb-6"
                      style={{ borderTop: '1px solid #2a2740', color: '#f0ecff' }}
                    >
                        <span>Total</span>
                        <span style={{ color: '#c9a84c' }}>KSh {subtotal.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full py-3 rounded-xl font-semibold mb-3 transition-all hover:-translate-y-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a)',
                          color: '#1a1400',
                          boxShadow: '0 4px 20px #c9a84c44',
                        }}
                    >
                        Proceed to Checkout
                    </button>
                    <button
                        onClick={() => dispatch(clearCart())}
                        className="w-full py-3 rounded-xl font-semibold transition-colors"
                        style={{ border: '1px solid #3a1a1a', color: '#e05555', background: 'transparent' }}
                    >
                        Clear Cart
                    </button>
                </div>

            </div>
        )}
    </div>
);
}

export default Cart;

