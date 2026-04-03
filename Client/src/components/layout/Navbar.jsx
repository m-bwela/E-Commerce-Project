import { Link } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Navbar() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground">
          MyShop
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar