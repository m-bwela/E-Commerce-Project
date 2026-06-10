import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/store/productsSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { addToCart } from '@/store/cartSlice'
import toast from 'react-hot-toast'
import { ShoppingCart, Search, X } from 'lucide-react'

function Products() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  // Read products data from Redux store
  const { products, loading, error } = useSelector((state) => state.products)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [allCategories, setAllCategories] = useState([])
  const debounceRef = useRef(null)

  // Fetch products when the page loads
  // The empty dependency array [] means "run once when component mounts"
   // 1. Initial load
useEffect(() => {
  dispatch(fetchProducts())
}, [dispatch])

// 2. Capture categories from the unfiltered list
useEffect(() => {
  if (!search && !category && products.length > 0) {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))]
    setAllCategories(unique)
  }
}, [products, search, category])

// 3. Re-fetch on search (400ms debounce) or category change (instant)
useEffect(() => {
  clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(() => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    dispatch(fetchProducts(params))
  }, search ? 400 : 0)
  return () => clearTimeout(debounceRef.current)
}, [search, category, dispatch])
  
  const handleAddToCart = (e, productId) => {
    e.preventDefault();           // stop the Link from navigating
    if (!user) {
        toast.error("Please log in to add items to your cart");
        navigate("/login");
        return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));

    toast.success("Item added to cart");
  };

  const clearFilters = () => {
     setSearch('')
     setCategory('')
  }
  const hasFilters = search || category

  // ---PRODUCTS GRID ---
  return (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6"
      style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}>
      Products
    </h1>

    {/* FILTER BAR */}
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9b96b0' }} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2 rounded-lg text-sm outline-none"
          style={{ background: '#16141f', border: '1px solid #2a2740', color: '#e8e4f0' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9b96b0' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category pills */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory('')} className="px-4 py-1 rounded-full text-sm font-medium"
            style={!category
              ? { background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }
              : { background: '#16141f', border: '1px solid #2a2740', color: '#9b96b0' }}>
            All
          </button>
          {allCategories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat === category ? '' : cat)}
              className="px-4 py-1 rounded-full text-sm font-medium"
              style={category === cat
                ? { background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400' }
                : { background: '#16141f', border: '1px solid #2a2740', color: '#9b96b0' }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Count + clear */}
      <div className="flex items-center justify-between text-sm" style={{ color: '#9b96b0' }}>
        <span>{loading ? 'Searching...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}</span>
        {hasFilters && (
          <button onClick={clearFilters} className="hover:underline" style={{ color: '#c9a84c' }}>Clear filters</button>
        )}
      </div>
    </div>

    {/* Loading skeleton */}
    {loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-4">
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )}

    {/* Empty state */}
    {!loading && products.length === 0 && (
      <div className="text-center py-16">
        <p className="text-lg mb-2" style={{ color: '#e8e4f0' }}>No products found</p>
        <p className="text-sm mb-4" style={{ color: '#9b96b0' }}>
          {hasFilters ? 'Try a different search or category' : 'No products available yet'}
        </p>
        {hasFilters && <button onClick={clearFilters} className="text-sm underline" style={{ color: '#c9a84c' }}>Clear filters</button>}
      </div>
    )}

    {/* Products grid */}
    {!loading && products.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}
            className="group relative rounded-xl overflow-hidden transition-all hover:-translate-y-1"
            style={{ border: '1px solid #2a2740', background: '#181622', boxShadow: '0 2px 16px #00000044' }}>
            <div className="aspect-square bg-muted overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: '#c9a84c', fontWeight: 600 }}>{product.category}</p>
              <h3 className="font-semibold" style={{ color: '#e8e4f0' }}>{product.name}</h3>
              <p className="text-lg font-bold" style={{ color: '#c9a84c' }}>KSh {product.price.toLocaleString()}</p>
            </div>
            <button onClick={(e) => handleAddToCart(e, product.id)}
              className="absolute top-2 right-2 p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400', boxShadow: '0 2px 12px #c9a84c55' }}>
              <ShoppingCart className="w-5 h-5" />
            </button>
          </Link>
        ))}
      </div>
    )}
  </div>
)
}

export default Products 