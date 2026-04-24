import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, User, Logout } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // Read the user from Redux - null means not logged in
  const { user } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className='border-b border-border bg-background sticky top-0 z-50'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Logo */}
        <Link to='/' className='text-xl font-bold text-foreground'>
          GenZiiShop
        </Link>

        {/* Navigation Links */}
        <nav className='hidden md:flex items-center gap-6'>
          <Link
            to='/products'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
          Products
          </Link>
        </nav>

        {/* Right side - cart + auth */}
        <div className='flex items-center gap-2'>
          {/* cart icon - always visible */}
          <Link to='/cart'>
            <Button variant='ghost' size='icon'> 
              <ShoppingCart className='w-5 h-5' />
            </Button>
          </Link>

          {user ? (
            // --- LOGGED IN: show name + logout ---
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hi, {user.fullName.split(' ')[0]}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            // --- GUEST: show login button ---
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}