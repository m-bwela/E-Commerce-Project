import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/store/productsSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { addToCart } from '@/store/cartSlice'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'

function Products() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  // Read products data from Redux store
  const { products, loading, error } = useSelector((state) => state.products)

  // Fetch products when the page loads
  // The empty dependency array [] means "run once when component mounts"
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  // ---LOADING STATE ---
  // Show skeleton placeholders while products are loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create 8 skeleton cards as placeholders */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---ERROR STATE ---
  // Show error message if fetching products failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => dispatch(fetchProducts())} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  // ---EMPTY STATE ---
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <p className="text-muted-foreground">No products available yet.</p>
      </div>
    )
  }
  
  const handleAddToCart = (e, productId) => {
    e.preventDefault();           // stop the Link from navigating
    if (!user) {
        toast.error("Please log in to add items to your cart");
        navigate("/login");
        return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
};

  // ---PRODUCTS GRID ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}
      >Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group relative rounded-xl overflow-hidden transition-all hover:-translate-y-1"
            style={{ border: '1px solid #2a2740', background: '#181622', boxShadow: '0 2px 16px #00000044' }}
          >
            {/* Product Image */}
            <div className="aspect-square bg-muted overflow-hidden">
              {product.image ? (
                <img
                  src={`${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: '#c9a84c', fontWeight: 600 }}>
                {product.category}
              </p>
              <h3 className="font-semibold" style={{ color: '#e8e4f0' }}>
                {product.name}
              </h3>
              <p className="text-lg font-bold" style={{ color: '#c9a84c' }}>
                KSh {product.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => handleAddToCart(e, product.id)}
              className="absolute top-2 right-2 text-white p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400', boxShadow: '0 2px 12px #c9a84c55' }}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Products 