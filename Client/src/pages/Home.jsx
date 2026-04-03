import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Home() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to MyShop</h1>
      <p className="text-muted-foreground mb-8">Discover amazing products at great prices.</p>
      <Link to="/products">
        <Button size="lg">Browse Products</Button>
      </Link>
    </div>
  )
}

export default Home