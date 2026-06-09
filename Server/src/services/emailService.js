import nodemailer from 'nodemailer';

// The transporter = the "email sender" configured to use your email service (like Gmail, Outlook, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address (from .env)
        pass: process.env.EMAIL_PASS  // Your email password or app-specific password (from .env)
    },
});

//called after an order is created
// order = the full order object from prisma (includes items + products)
// userEmail = the customer's email address
// userName = the customer's full name (for a personalized greeting)
export const sendOrderConfirmation = async (order, userEmail, userName) => {
    const itemRows = order.items
        .map(
            (item) =>
                `<tr>
                    <td style="padding:6px 0;color:#e8e4f0;">${item.product?.name ?? 'Item'}</td>
                    <td style="padding:6px 0;color:#9b96b0;text-align:center;">${item.quantity}</td>
                    <td style="padding:6px 0;color:#c9a84c;text-align:right;">KSh ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>`
        )
        .join('');

        const html = `
        <div style="background:#0a0a0f;padding:32px;font-family:'DM Sans',sans-serif;max-width:560px;margin:auto;border-radius:16px;">
            <h1 style="font-family:Georgia,serif;color:#c9a84c;margin-top:0;">GenZiiShop</h1>
            <h2 style="color:#e8e4f0;">Order Confirmed 🎉</h2>
            <p style="color:#9b96b0;">Hi ${userName}, your order has been placed successfully!</p>

            <div style="background:#181622;border:1px solid #2a2740;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="color:#9b96b0;font-size:12px;margin:0 0 4px;">Order ID</p>
                <p style="color:#e8e4f0;font-size:12px;font-family:monospace;margin:0 0 16px;">${order.id}</p>

                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid #2a2740;">
                            <th style="padding:6px 0;color:#9b96b0;font-weight:500;text-align:left;font-size:12px;">Item</th>
                            <th style="padding:6px 0;color:#9b96b0;font-weight:500;text-align:center;font-size:12px;">Qty</th>
                            <th style="padding:6px 0;color:#9b96b0;font-weight:500;text-align:right;font-size:12px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
            
                <div style="border-top:1px solid #2a2740;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;">
                    <span style="color:#e8e4f0;font-weight:bold;">Total</span>
                    <span style="color:#c9a84c;font-weight:bold;font-size:18px;">KSh ${Number(order.total).toLocaleString()}</span>
                </div>
            </div>

            <p style="color:#9b96b0;font-size:13px;">We'll notify you once your order is shipped. Thank you for shopping with us!</p>
        </div>
        `;

        await transporter.sendMail({
            from: `GenZiiShop <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Order Confirmed - KSh ${Number(order.total).toLocaleString()}`,
            html,
        });
};