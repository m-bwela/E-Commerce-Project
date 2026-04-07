const prisma = require('../config/db');

// GET /api/products — list products with search/filter/pagination
const getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    // req.query = URL parameters like /api/products?category=shoes&page=2
    const skip = (page - 1) * limit;
    // Page 1: skip 0, Page 2: skip 12, Page 3: skip 24...

    const where = {};
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    // 'insensitive' = "nike" matches "Nike", "NIKE", etc.

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    // Promise.all = run both queries at the SAME TIME (faster than one after the other)

    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id — single product
const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    // req.params.id = the ":id" part from the URL like /api/products/abc-123
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products — create (admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, image, category, stock },
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — update (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,  // Only updates the fields that were sent
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — delete (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };