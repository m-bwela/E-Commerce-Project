import prisma from '../config/db.js';

export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['USER', 'ADMIN'].includes(role)) {
           res.status(400);
           throw new Error('Invalid role. Must be either USER or ADMIN');
        }
        if (req.params.id === req.user.id) {
            res.status(400);
            throw new Error('You cannot change your own role');
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true
            },
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            res.status(400);
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
            },
        });
        res.json(order);
    } catch (error) {
        next(error);
    }
}

export const getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrders] =
        await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { not: 'CANCELLED' } },
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { fullName: true, email: true }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                },
            }),
        ]);
        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: revenueResult._sum.total || 0,
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};
