import prisma from '../config/db.js'

// Get all products
export const getProducts = async (req, res, next) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query
        const skip = (page - 1) * limit

        const where = {}
        if (category) where.category = category
        if (search) where.name = { contains: search, mode: 'insensitive' }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: Number(limit), 
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ])

        res.json({
            products,
            total,
            pages: Math.ceil(total / limit)
        })
    } catch (error) {
        next(error)
    }
}

// Get single product
export const getProduct = async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id }
        })
        if (!product) {
            res.status(404)
            throw new Error('Product not found')
        }
        res.json(product)
    } catch (error) {
        next(error)
    }
}

// Create product
export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, image, category, stock } = req.body
        const product = await prisma.product.create({
            data: { name, description, price, image, category, stock },
        })
        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
}

// Update product
export const updateProduct = async (req, res, next) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: req.body,
        })
        res.json(product)
    } catch (error) {
        next(error)
    }
}

// Delete product
export const deleteProduct = async (req, res, next) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id }
        })
        res.json({ message: 'Product deleted' })
    } catch (error) {
        next(error)
    }
}