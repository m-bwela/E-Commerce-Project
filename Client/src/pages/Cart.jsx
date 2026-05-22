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
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {/* BRANCH 1 — Not logged in */}
        {!user && (
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Please log in to view your cart.</p>
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded">
                    Log In
                </Link>
            </div>
        )}

        {/* BRANCH 2 — Loading */}
        {user && loading && (
            <p className="text-gray-400">Loading cart...</p>
        )}

        {/* BRANCH 3 — Empty cart */}
        {user && !loading && (!cart || cart.items.length === 0) && (
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded">
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
                        <div key={item.id} className="flex items-center gap-4 border-b py-4">
                            <img
                                src={`http://localhost:5000${item.product.imageUrl}`}
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-gray-500">${item.product.price.toFixed(2)}</p>
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
                                    className="w-8 h-8 border rounded flex items-center justify-center"
                                >
                                    −
                                </button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                                    className="w-8 h-8 border rounded flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>

                            <p className="w-20 text-right font-medium">
                                ${(item.product.price * item.quantity).toFixed(2)}
                            </p>

                            <button
                                onClick={() => dispatch(removeCartItem(item.id))}
                                className="text-red-500 hover:text-red-700 ml-2"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* RIGHT — Order summary */}
                <div className="w-full lg:w-80 border rounded-lg p-6 h-fit">
                    <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4 mb-6">
                        <span>Total</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3"
                    >
                        Proceed to Checkout
                    </button>
                    <button
                        onClick={() => dispatch(clearCart())}
                        className="w-full border border-red-500 text-red-500 py-3 rounded-lg"
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

