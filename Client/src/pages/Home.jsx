import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'linear-gradient(160deg, #0a0a0f 60%, #1a1428 100%)' }}
    >
      {/* Eyebrow label */}
      <p
        className="text-xs font-semibold uppercase tracking-[4px] mb-5"
        style={{ color: '#c9a84c' }}
      >
        Curated Luxury
      </p>

      {/* Headline */}
      <h1
        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}
      >
        Discover Your
        <br />
        <span style={{ color: '#c9a84c' }}>Signature Style</span>
      </h1>

      {/* Sub-headline */}
      <p className="text-lg max-w-xl mb-10" style={{ color: '#9b96b0', lineHeight: 1.8 }}>
        Premium products, curated for those who appreciate the finest things.
        Shop our exclusive collections today.
      </p>

      {/* CTA buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link to="/products">
          <Button
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a)',
              color: '#1a1400',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 24px #c9a84c44',
            }}
          >
            Browse Collection
          </Button>
        </Link>
        <Link to="/register">
          <Button
            size="lg"
            variant="outline"
            style={{ borderColor: '#2a2740', color: '#9b96b0' }}
          >
            Create Account
          </Button>
        </Link>
      </div>

      {/* Decorative gold line */}
      <div
        className="mt-20 w-24 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }}
      />
    </div>
  )
}

export default Home