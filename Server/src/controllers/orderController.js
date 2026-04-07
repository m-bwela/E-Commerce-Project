const prisma = require('../config/db');

// POST /api/orders — create order from cart
const createOrder = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Get the user's cart with all items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    // Calculate total price
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    // reduce = loop through items, multiply price × quantity, add to running sum

    // Create the order with all items
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        phoneNumber,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,  // Snapshot the price at time of order
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear the cart after ordering
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — user's orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },  // Newest first
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — single order
const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });

    // Make sure user can only see THEIR orders
    if (!order || order.userId !== req.user.id) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/all — admin: all orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder, getAllOrders };