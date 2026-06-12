import axios from 'axios';
import prisma from '../config/db.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Step 1 of every M-Pesa request: get a short-lived OAuth token from Safaricom
// This token proves our app is allowed to use the Daraja API
const getAccessToken = async () => {
  // Base64-encode "ConsumerKey:ConsumerSecret" — Safaricom uses HTTP Basic Auth
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  // data.access_token = a string like "abcdef123456..." valid for ~1 hour
  return data.access_token;
};

// Build the password Safaricom needs to verify the STK push request
// Formula: Base64( Shortcode + Passkey + Timestamp )
const getPassword = (timestamp) => {
  const raw = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(raw).toString('base64');
};

// Format the current date as YYYYMMDDHHmmss — Safaricom's required timestamp format
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0'); // pad single digits: 9 → "09"
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) + // months are 0-indexed in JS, so +1
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
};

// Format phone number to the 2547XXXXXXXX format Safaricom requires
// Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
const formatPhone = (phone) => {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, ''); // remove spaces and leading +
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1); // 07... → 2547...
  return cleaned; // already in 254... format
};

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

// POST /api/mpesa/stk-push
// Called by the frontend when user clicks "Pay with M-Pesa" on the Checkout page
// Body: { orderId, phone }
export const stkPush = async (req, res, next) => {
  try {
    const { orderId, phone } = req.body;

    // Validate the order belongs to this user and is still PENDING
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== req.user.id) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.status !== 'PENDING') {
      res.status(400);
      throw new Error('Order is no longer pending');
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);
    const formattedPhone = formatPhone(phone);

    // The STK Push payload — sent to Safaricom to trigger the payment prompt
    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(order.total), // M-Pesa only accepts whole numbers
      PartyA: formattedPhone,         // The customer's phone number
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,    // Same as PartyA for STK push
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `Order-${orderId.slice(0, 8)}`, // Short reference shown on phone
      TransactionDesc: 'E-Commerce Order Payment',
    };

    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // ResponseCode "0" means Safaricom accepted and sent the STK push to the phone
    if (data.ResponseCode !== '0') {
      res.status(400);
      throw new Error(data.ResponseDescription || 'STK push failed');
    }

    // Save the CheckoutRequestID so we can match it when the callback arrives
    await prisma.order.update({
      where: { id: orderId },
      data: { mpesaReceiptNo: data.CheckoutRequestID },
    });

    res.json({
      message: 'STK push sent. Check your phone.',
      checkoutRequestId: data.CheckoutRequestID,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/mpesa/callback
// Safaricom calls THIS endpoint after the user approves or rejects on their phone
// This route must be PUBLIC (no auth middleware) — Safaricom doesn't have our cookie
export const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const result = Body?.stkCallback;

    if (!result) {
      // Malformed callback — just respond 200 so Safaricom doesn't retry
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { ResultCode, CheckoutRequestID, CallbackMetadata } = result;

    // Find the order that matches this checkout request
    const order = await prisma.order.findFirst({
      where: { mpesaReceiptNo: CheckoutRequestID },
    });

    if (!order) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (ResultCode === 0) {
      // ✅ Payment successful — extract the M-Pesa receipt number from metadata
      // CallbackMetadata.Item is an array like: [ { Name: "MpesaReceiptNumber", Value: "QBE2XXXXXX" }, ... ]
      const items = CallbackMetadata?.Item || [];
      const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
      const receiptNumber = receiptItem?.Value || CheckoutRequestID;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          mpesaReceiptNo: receiptNumber, // overwrite the CheckoutRequestID with the real receipt
        },
      });
    } else {
      // ❌ Payment failed or cancelled — keep order as PENDING so user can retry
      console.log(`M-Pesa payment failed for order ${order.id}. ResultCode: ${ResultCode}`);
    }

    // Always respond 200 — Safaricom will keep retrying if we don't
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error.message);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // still respond 200
  }
};

// GET /api/mpesa/status/:orderId
// Frontend polls this every 3 seconds after STK push to know if payment went through
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      select: { id: true, status: true, userId: true },
    });

    if (!order || order.userId !== req.user.id) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({ status: order.status });
  } catch (error) {
    next(error);
  }
};
