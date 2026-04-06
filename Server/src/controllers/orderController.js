import prisma from '../config/db.js'

// Create order
export const createOrder = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body

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

        if (!cart || cart.items.length === 0) {
            res.status(400)
            throw new Error('Cart is empty')
        }

        const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                total,
                phoneNumber,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
        })

        // clear cart after order is created
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        })

        res.status(201).json(order)
    } catch (error) {
        next(error)
    }
}

// Get user orders
export const getOrders = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        })
        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}

// Get single order
export const getOrder = async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })
        res.status(200).json(order)
    } catch (error) {
        next(error)
    }
}

// Admin - Get all orders
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: { fullName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        })
        res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
}