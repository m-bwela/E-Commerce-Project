import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearProduct } from '@/store/productsSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

function ProductDetail() {
  const { id } = useParams() // Get product ID from URL
  // useParams() reads the ".:id" part from the URL
  // eg. /products/abc-123 -> id = "abc-123"

  const dispatch = useDispatch()
  const { product, loading, error } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProductById(id))

    // Cleanup: clear product datawhen leaving this page
    // This prevents showing stale data if you visit another product
    return () => {
      dispatch(clearProduct())
    }
  }, [dispatch, id])

  // ---LOADING STATE---
  if (loading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>
        </div>
      </div>
    )
  }

  // ---ERROR STATE---
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive text-lg">{error}</p>
        <Link to="/products">
          <Button className="mt-4">Back to Products</Button>
        </Link>
      </div>
    )
  }

  // ---PRODUCT DETAIL---
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Back Button */}
      <Link 
        to="/products"
        className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Products
      </Link>

      <div className='grid md:grid-cols-2 gap-8'>
        {/* Product Image */}
        <div className='aspect-square bg-muted rounded-lg overflow-hidden'>
          {product.image ? (
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-4'>
          <Badge variant="secondary">
            {product.category}
          </Badge>
          <h1 className='text-3xl font-bold'>
            {product.name}
          </h1>
          <p className='text-3xl font-bold text-primary'>
            KSH {product.price.toLocaleString()}
          </p>
          <p className='text-muted-foreground leading-relaxed'>
            {product.description}
          </p>
          <p className='text-sm text-muted-foreground'>
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Out of stock'}
          </p>
          <Button size='lg' disabled={product.stock === 0}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail