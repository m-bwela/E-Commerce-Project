import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

// Builds a 5-step visual progress tracker based on the current order status.
// Active steps (already reached) are shown in gold; future steps are greyed out.
const buildStatusTracker = (status) => {
    const statusToStep = { PENDING: 0, PAID: 1, SHIPPED: 2, DELIVERED: 4, CANCELLED: -1 };
    const currentStep = statusToStep[status] ?? 0;

    const steps = [
        { label: 'Order<br>Placed',      icon: '&#128230;' },
        { label: 'Payment<br>Confirmed', icon: '&#10003;'  },
        { label: 'Shipped',              icon: '&#128666;' },
        { label: 'Ready for<br>Pickup',  icon: '&#128204;' },
        { label: 'Picked Up',            icon: '&#127881;' },
    ];

    const cells = steps.map((step, i) => {
        const active    = i <= currentStep;
        const nextActive = (i + 1) <= currentStep;
        const circleBg  = active ? '#c9a84c' : '#2a2740';
        const iconColor = active ? '#1a1400' : '#6b6880';
        const labelColor = active ? '#c9a84c' : '#6b6880';
        const symbol    = active ? step.icon : String(i + 1);
        const connColor = (active && nextActive) ? '#c9a84c' : '#2a2740';

        const circle = `<div style="width:34px;height:34px;border-radius:50%;background:${circleBg};color:${iconColor};font-weight:bold;font-size:15px;line-height:34px;text-align:center;margin:0 auto;">${symbol}</div>`;
        const label  = `<p style="font-size:10px;color:${labelColor};margin:5px 0 0;text-align:center;line-height:1.4;">${step.label}</p>`;
        const cell   = `<td width="16%" align="center" valign="top">${circle}${label}</td>`;
        const conn   = i < steps.length - 1
            ? `<td valign="top" style="padding-top:17px;"><div style="height:2px;background:${connColor};width:100%;"></div></td>`
            : '';
        return cell + conn;
    }).join('');

    return `
    <div style="margin:24px 0;">
        <p style="color:#9b96b0;font-size:12px;margin:0 0 10px;">Order Progress</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
    </div>`;
};

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
            <h1 style="font-family:Georgia,serif;color:#c9a84c;margin-top:0;text-align:center;">GenZiiShop</h1>
            <h2 style="color:#e8e4f0;">Order Confirmed 🎉</h2>
            <p style="color:#9b96b0;">Hi ${userName},</p>
            <br />
            <p style="color:#9b96b0;">
                Thank you for shopping on GenZiiShop, your order <strong style="color:#e8e4f0;">${order.id}</strong> has been confirmed! And we received your payment of <strong style="color:#c9a84c;">Ksh ${Number(order.total).toLocaleString()}</strong> successfully.
                 Your order is now being processed and will be shipped to you soon.
            </p>

            ${buildStatusTracker(order.status)}

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
                    <span style="color:#08CB00;font-weight:bold;font-size:15px;">Ksh ${Number(order.total).toLocaleString()}</span>
                </div>
            </div>

            <p style="color:#9b96b0;font-size:13px;">We'll notify you once your order is shipped. Thank you for choosing GenZiiShop!</p>
        </div>
        `;

        await transporter.sendMail({
            from: `GenZiiShop <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Your GenZiishop Order ${order.id} has been Confirmed.`,
            html,
        });
};