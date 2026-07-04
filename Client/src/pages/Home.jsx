import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import { fetchProducts } from '@/store/productsSlice'
import { addToCart } from '@/store/cartSlice'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Search, ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

function GoldOrb() {
  const mesh = useRef()
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.15
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2
  })
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 4]} />
        <MeshDistortMaterial color="#c9a84c" emissive="#b8922a" emissiveIntensity={0.3}
          distort={0.35} speed={1.5} roughness={0.1} metalness={0.9} />
      </mesh>
    </Float>
  )
}

function SectionHeader({ icon, title, link }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff', fontSize: '1.4rem', fontWeight: 700 }}>{title}</h2>
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-1 text-sm hover:underline" style={{ color: '#c9a84c' }}>
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden animate-pulse"
      style={{ width: '200px', background: '#181622', border: '1px solid #2a2740' }}>
      <div style={{ height: '200px', background: '#1e1b2e' }} />
      <div className="p-3 space-y-2">
        <div style={{ height: '10px', background: '#2a2740', borderRadius: '4px', width: '60%' }} />
        <div style={{ height: '12px', background: '#2a2740', borderRadius: '4px', width: '80%' }} />
        <div style={{ height: '12px', background: '#2a2740', borderRadius: '4px', width: '40%' }} />
      </div>
    </div>
  )
}

function HomeProductCard({ product, onAddToCart }) {
  return (
    <Link to={`/products/${product.id}`}
      className="group relative flex-shrink-0 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
      style={{ width: '200px', border: '1px solid #2a2740', background: '#181622', boxShadow: '0 2px 16px #00000044' }}>
      <div className="overflow-hidden" style={{ height: '200px', background: '#0f0e18' }}>
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
        }
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs uppercase tracking-wide truncate" style={{ color: '#c9a84c', fontWeight: 600 }}>{product.category}</p>
        <h3 className="text-sm font-semibold truncate" style={{ color: '#e8e4f0' }}>{product.name}</h3>
        <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>KSh {product.price.toLocaleString()}</p>
      </div>
      <button onClick={(e) => { e.preventDefault(); onAddToCart(product.id) }}
        className="absolute top-2 right-2 p-2 rounded-full transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#1a1400', boxShadow: '0 2px 12px #c9a84c55' }}>
        <ShoppingCart className="w-4 h-4" />
      </button>
      {product.stock > 0 && product.stock <= 5 && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Only {product.stock} left
        </div>
      )}
    </Link>
  )
}

function GridProductCard({ product, onAddToCart }) {
  return (
    <Link to={`/products/${product.id}`}
      className="group rounded-xl overflow-hidden transition-all hover:-translate-y-1"
      style={{ border: '1px solid #2a2740', background: '#181622' }}>
      <div className="overflow-hidden" style={{ height: '200px', background: '#0f0e18' }}>
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
        }
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide" style={{ color: '#c9a84c', fontWeight: 600 }}>{product.category}</p>
        <h3 className="text-sm font-semibold mt-1 truncate" style={{ color: '#e8e4f0' }}>{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>KSh {product.price.toLocaleString()}</span>
          <button onClick={(e) => { e.preventDefault(); onAddToCart(product.id) }}
            className="p-1.5 rounded-full transition-all hover:scale-110"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#1a1400' }}>
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Link>
  )
}

const CATEGORY_STYLES = {
  'Men':         { emoji: '👔', bg: 'linear-gradient(135deg,#1a2040,#2a3060)', border: '#3a4a8c' },
  'Women':       { emoji: '👗', bg: 'linear-gradient(135deg,#2a1028,#3a1838)', border: '#8c3a70' },
  'Kids':        { emoji: '🧸', bg: 'linear-gradient(135deg,#1a2818,#223822)', border: '#4a8c3a' },
  'Electronics': { emoji: '📱', bg: 'linear-gradient(135deg,#1a1a28,#252540)', border: '#5a5a9c' },
  'Shoes':       { emoji: '👟', bg: 'linear-gradient(135deg,#281a10,#382410)', border: '#8c5a3a' },
  'Bags':        { emoji: '👜', bg: 'linear-gradient(135deg,#1a1010,#281818)', border: '#8c4a4a' },
  'Accessories': { emoji: '💎', bg: 'linear-gradient(135deg,#1a1618,#221c20)', border: '#6a5a5a' },
  'Clothing':    { emoji: '🧥', bg: 'linear-gradient(135deg,#1a1028,#221838)', border: '#6a3a8c' },
}
const getCategoryStyle = (cat) =>
  CATEGORY_STYLES[cat] || { emoji: '🛍️', bg: 'linear-gradient(135deg,#181622,#201c2a)', border: '#2a2740' }

function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { products, loading } = useSelector((state) => state.products)
  const { user } = useSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchProducts({ limit: 50 }))
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
  }

  const handleAddToCart = (productId) => {
    if (!user) { toast.error('Please log in to add items to your cart'); navigate('/login'); return }
    dispatch(addToCart({ productId, quantity: 1 }))
    toast.success('Added to cart')
  }

  const categories  = [...new Set(products.map((p) => p.category).filter(Boolean))]
  const featured    = products.slice(0, 6)
  const newArrivals = products.slice(0, 4)
  const trending    = products.filter((p) => p.stock > 0 && p.stock < 15).slice(0, 6)
  const featuredIds = new Set(featured.map((p) => p.id))
  const recommended = products.filter((p) => !featuredIds.has(p.id)).slice(0, 4)

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div className="relative flex flex-col items-center justify-center text-center px-4" style={{ height: '88vh' }}>
        <div className="absolute inset-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#e8c96a" />
            <pointLight position={[-5, -3, -5]} intensity={0.5} color="#6040a0" />
            <GoldOrb />
          </Canvas>
        </div>

        <p className="relative z-10 text-xs font-semibold uppercase tracking-[4px] mb-4" style={{ color: '#c9a84c' }}>Curated Luxury</p>
        <h1 className="relative z-10 text-5xl md:text-7xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}>
          Discover Your<br /><span style={{ color: '#c9a84c' }}>Signature Style</span>
        </h1>
        <p className="relative z-10 text-lg max-w-lg mb-6" style={{ color: '#9b96b0', lineHeight: 1.8 }}>
          Premium products, curated for those who appreciate the finest things.
        </p>

        <form onSubmit={handleSearch} className="relative z-10 w-full max-w-lg mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9b96b0' }} />
            <input type="text" placeholder="Search for products, brands..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3 rounded-full text-sm outline-none"
              style={{ background: 'rgba(16,14,24,0.85)', border: '1px solid #3a3750', color: '#e8e4f0', backdropFilter: 'blur(12px)' }}
            />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#1a1400' }}>
              Search
            </button>
          </div>
        </form>

        <div className="flex gap-4 flex-wrap justify-center relative z-10">
          <Link to="/products">
            <Button size="lg" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a,#b8922a)', color: '#1a1400', fontWeight: 700, border: 'none', boxShadow: '0 4px 24px #c9a84c44' }}>
              Browse Collection
            </Button>
          </Link>
          {!user && (
            <Link to="/register">
              <Button size="lg" variant="outline" style={{ borderColor: '#2a2740', color: '#9b96b0' }}>Create Account</Button>
            </Link>
          )}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
          <p className="text-xs" style={{ color: '#4a4760' }}>Scroll to explore</p>
          <div className="w-px h-8 animate-pulse" style={{ background: 'linear-gradient(to bottom,#c9a84c,transparent)' }} />
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="container mx-auto px-4 py-14">
        <SectionHeader icon={<span className="text-xl">🏷️</span>} title="Shop by Category" link="/products" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading && categories.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl animate-pulse" style={{ height: '96px', background: '#181622' }} />)
            : categories.map((cat) => {
                const s = getCategoryStyle(cat)
                return (
                  <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                    className="rounded-xl p-5 text-center transition-all hover:-translate-y-1"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <div className="text-3xl mb-2">{s.emoji}</div>
                    <p className="text-sm font-semibold" style={{ color: '#e8e4f0' }}>{cat}</p>
                  </Link>
                )
              })
          }
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-14" style={{ background: '#0d0b14' }}>
        <div className="container mx-auto px-4">
          <SectionHeader icon={<Star className="w-5 h-5" style={{ color: '#c9a84c' }} />} title="Featured Products" link="/products" />
          <div className="overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2740 transparent' }}>
            <div className="flex gap-4">
              {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : featured.map((p) => <HomeProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-14 container mx-auto px-4">
        <SectionHeader icon={<Sparkles className="w-5 h-5" style={{ color: '#c9a84c' }} />} title="New Arrivals" link="/products" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-xl animate-pulse" style={{ height: '280px', background: '#181622' }} />)
            : newArrivals.map((p) => <GridProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)
          }
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      {(trending.length > 0 || loading) && (
        <section className="py-14" style={{ background: '#0d0b14' }}>
          <div className="container mx-auto px-4">
            <SectionHeader icon={<TrendingUp className="w-5 h-5" style={{ color: '#ef4444' }} />} title="Trending Now" link="/products" />
            <div className="overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2740 transparent' }}>
              <div className="flex gap-4">
                {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : trending.map((p) => <HomeProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── RECOMMENDED FOR YOU ── */}
      <section className="py-14 container mx-auto px-4">
        <SectionHeader icon={<span className="text-xl">✨</span>} title={user ? 'Recommended for You' : 'You Might Also Like'} link="/products" />
        {!user ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#181622', border: '1px solid #2a2740' }}>
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#e8e4f0' }}>Sign in for Personalised Picks</h3>
            <p className="text-sm mb-6" style={{ color: '#9b96b0' }}>Create an account to get recommendations based on your style preferences.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login"><Button style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#1a1400', fontWeight: 700, border: 'none' }}>Sign In</Button></Link>
              <Link to="/register"><Button variant="outline" style={{ borderColor: '#2a2740', color: '#9b96b0' }}>Create Account</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-xl animate-pulse" style={{ height: '280px', background: '#181622' }} />)
              : recommended.length > 0
                ? recommended.map((p) => <GridProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)
                : <p className="col-span-4 text-center py-8" style={{ color: '#9b96b0' }}>Keep shopping to get personalised recommendations!</p>
            }
          </div>
        )}
      </section>

      {/* ── BOTTOM BANNER ── */}
      <section className="py-20 text-center" style={{ background: 'linear-gradient(135deg,#1a1428,#0a0a0f)' }}>
        <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)' }} />
        <p className="text-xs uppercase tracking-[4px] mb-3" style={{ color: '#c9a84c' }}>GenZiiShop</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}>Ready to Elevate Your Style?</h2>
        <p className="text-sm mb-8" style={{ color: '#9b96b0' }}>Join thousands of satisfied customers shopping the finest collection.</p>
        <Link to="/products">
          <Button size="lg" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a,#b8922a)', color: '#1a1400', fontWeight: 700, border: 'none', boxShadow: '0 4px 24px #c9a84c44' }}>
            Shop the Collection
          </Button>
        </Link>
        <div className="w-16 h-px mx-auto mt-6" style={{ background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)' }} />
      </section>

    </div>
  )
}

export default Home