import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/store/productsSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function Products() {
  const dispatch = useDispatch()
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

  // ---PRODUCTS GRID ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="aspect-square bg-muted overflow-hidden">
              {product.image ? (
                <img
                  src={`http://localhost:5000${product.image}`}
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-lg font-bold">
                KSh {product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Products 