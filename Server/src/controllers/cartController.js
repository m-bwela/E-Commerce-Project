const prisma = require('../config/db');

// GET /api/cart — get user's cart
const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      // include = JOIN. "Get the cart AND its items AND each item's product details"
    });

    // If user has no cart yet, create an empty one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: true } } },
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart — add item to cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Find or create the user's cart
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    // Check if this product is already in the cart
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      // This uses the @@unique([cartId, productId]) we defined in schema
    });

    if (existingItem) {
      // Already in cart? Just increase quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Not in cart? Add new item
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    // Return the updated cart with all product details
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId — update quantity
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Quantity 0 or less = remove the item
      await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: req.params.itemId },
        data: { quantity },
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart — clear entire cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      // deleteMany = delete ALL items where cartId matches
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, clearCart };