import mongoose from 'mongoose';
import { Router } from 'express';
import { authMiddleware } from './auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ── Subscription Schema ────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema({
  userId:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan:                   { type: String, enum: ['free', 'pro'], default: 'free' },
  status:                 { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  upiTransactionId:       { type: String, default: '' },
  razorpaySubscriptionId: { type: String, default: '' },
  amount:                 { type: Number, default: 0 },
  currency:               { type: String, default: 'INR' },
  activatedAt:            { type: Date },
  expiresAt:              { type: Date },
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ── Razorpay Setup ─────────────────────────────────────────────────────
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// ── Payment Router ─────────────────────────────────────────────────────
const paymentRouter = Router();

// GET /config - Get payment configuration (public endpoint)
paymentRouter.get('/config', async (req, res) => {
  try {
    res.json({
      razorpayEnabled: !!razorpay,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      upiId: process.env.UPI_ID || 'radheshranvijay@fam',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /status - Get current user's subscription status
paymentRouter.get('/status', authMiddleware, async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub) {
      sub = await Subscription.create({ userId: req.user.id, plan: 'free', status: 'active' });
    }
    // Check expiry
    if (sub.plan === 'pro' && sub.expiresAt && new Date() > sub.expiresAt) {
      sub.plan = 'free';
      sub.status = 'expired';
      await sub.save();
    }
    res.json({
      plan: sub.plan,
      status: sub.status,
      expiresAt: sub.expiresAt,
      activatedAt: sub.activatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /create-subscription - Create a new Razorpay subscription
paymentRouter.post('/create-subscription', authMiddleware, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ error: 'Razorpay is not configured on this server.' });
    }

    // 1. Get or create the Pro Plan in Razorpay
    let planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      const plans = await razorpay.plans.all();
      const existingPlan = plans.items.find(
        p => p.item.name === 'Notminelap Industries Pro Plan' && p.item.amount === 10000
      );
      if (existingPlan) {
        planId = existingPlan.id;
      } else {
        const plan = await razorpay.plans.create({
          period: 'monthly',
          interval: 1,
          item: {
            name: 'Notminelap Industries Pro Plan',
            amount: 10000, // ₹100 in paise
            currency: 'INR',
            description: 'Pro Plan Subscription - ₹100/month autopay',
          },
        });
        planId = plan.id;
      }
    }

    // 2. Create the subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 60, // 5 years of monthly billing cycles
      quantity: 1,
      customer_notify: 1,
    });

    // 3. Save pending subscription info in DB
    await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        plan: 'free',
        status: 'cancelled',
        upiTransactionId: '',
        amount: 100,
        currency: 'INR',
        razorpaySubscriptionId: subscription.id,
      },
      { upsert: true }
    );

    res.json({
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /verify - Verify signature and activate subscription
paymentRouter.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details for verification' });
    }

    if (!razorpay) {
      return res.status(400).json({ error: 'Razorpay is not configured on this server.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        plan: 'pro',
        status: 'active',
        upiTransactionId: '',
        amount: 100,
        currency: 'INR',
        activatedAt: now,
        expiresAt: expiresAt,
        razorpaySubscriptionId: razorpay_subscription_id,
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      plan: sub.plan,
      expiresAt: sub.expiresAt,
      message: 'Pro plan activated with autopay! Welcome aboard 🚀',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /activate - Activate pro plan manually (UPI transaction ID fallback)
paymentRouter.post('/activate', authMiddleware, async (req, res) => {
  try {
    const { upiTransactionId } = req.body;
    if (!upiTransactionId || upiTransactionId.trim().length < 4) {
      return res.status(400).json({ error: 'Valid UPI Transaction ID is required' });
    }

    let sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub) {
      sub = new Subscription({ userId: req.user.id });
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1); // 1 month

    sub.plan = 'pro';
    sub.status = 'active';
    sub.upiTransactionId = upiTransactionId.trim();
    sub.amount = 100;
    sub.currency = 'INR';
    sub.activatedAt = now;
    sub.expiresAt = expiry;
    await sub.save();

    res.json({
      success: true,
      plan: 'pro',
      expiresAt: expiry,
      message: 'Pro plan activated! Welcome aboard 🚀',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to check if user has pro plan
export function requirePro(req, res, next) {
  if (req.subscription?.plan !== 'pro') {
    return res.status(403).json({ error: 'Pro plan required', upgrade: true });
  }
  next();
}

// Middleware to attach subscription info to req
export async function attachSubscription(req, res, next) {
  try {
    if (req.user) {
      const sub = await Subscription.findOne({ userId: req.user.id });
      req.subscription = sub || { plan: 'free', status: 'active' };
      // Check expiry
      if (req.subscription.plan === 'pro' && req.subscription.expiresAt && new Date() > req.subscription.expiresAt) {
        req.subscription.plan = 'free';
        req.subscription.status = 'expired';
      }
    }
    next();
  } catch {
    req.subscription = { plan: 'free', status: 'active' };
    next();
  }
}

export { paymentRouter, Subscription };
