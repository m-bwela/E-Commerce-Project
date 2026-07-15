import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearProduct } from '@/store/productsSlice'
import { addToCart } from '@/store/cartSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function ProductDetail() {
  const { id } = useParams() // Get product ID from URL
  // useParams() reads the ".:id" part from the URL
  // eg. /products/abc-123 -> id = "abc-123"

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading, error } = useSelector((state) => state.products)
  const { user } = useSelector((state) => state.auth)
  const [selectedSize, setSelectedSize] = useState(null)
  const [adding, setAdding] = useState(false)

  const hasSizes = product?.sizes?.length > 0

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to your cart')
      navigate('/login')
      return
    }
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size first')
      return
    }
    setAdding(true)
    const result = await dispatch(addToCart({ productId: product.id, quantity: 1, size: selectedSize || undefined }))
    setAdding(false)
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Added to cart!')
      navigate('/cart')
    } else {
      toast.error(result.payload || 'Failed to add to cart')
    }
  }

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
              src={`${product.image}`}
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

          {/* Size selector — only shown for footwear products that have sizes defined */}
          {hasSizes && (
            <div className='space-y-2'>
              <p className='text-sm font-medium' style={{ color: '#e8e4f0' }}>
                Select Size
                    {!selectedSize && product.stock > 0 && (
                  <span className='ml-2 text-xs font-normal' style={{ color: '#f87171' }}>Required</span>
                )}
              </p>
              <div className='flex flex-wrap gap-2'>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                    className='px-4 py-1.5 rounded-lg text-sm font-medium transition-all'
                    style={
                      selectedSize === size
                        ? { background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#1a1400', border: '1px solid #c9a84c' }
                        : { background: '#16141f', color: '#e8e4f0', border: '1px solid #2a2740' }
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            size='lg'
            disabled={product.stock === 0 || (hasSizes && !selectedSize) || adding}
            onClick={handleAddToCart}
          >
            {product.stock === 0
              ? 'Out of Stock'
              : adding
                ? 'Adding...'
                : hasSizes && !selectedSize
                  ? 'Select a Size'
                  : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail