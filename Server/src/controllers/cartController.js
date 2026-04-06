import prisma from '../config/db.js'

export const getCart = async (req, res, next) => {
    try {
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id},
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        }
        res.json(cart)
    } catch (error) {
        next(error)
    }
}

// Add item to cart
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body 

        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id },
            })
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } },
        })

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            })
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            })
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
        })

        res.json(updatedCart)
    } catch (error) {
        next(error)
    }
}

// Update cart item quantity
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body

        if (quantity <= 0) { // Remove item if quantity is zero or less
            await prisma.cartItem.delete({ // Delete item from cart
                where: { id: req.params.itemId } 
            })
        } else {
            await prisma.cartItem.update({ // Update item quantity
                where: { id: req.params.itemId },
                data: { quantity },
            })
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        res.json(cart)
    } catch (error) {
        next(error)
    }
}

// Clear cart
export const clearCart = async (req, res, next) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        })

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            })
        }
        res.json({ message: 'Cart cleared' })
    } catch (error) {
        next(error)
    }
}