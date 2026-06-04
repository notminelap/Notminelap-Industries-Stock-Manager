import mongoose from 'mongoose';
import { Router } from 'express';
import { authMiddleware } from './auth.js';

// ── Subscription Schema ────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan:        { type: String, enum: ['free', 'pro'], default: 'free' },
  status:      { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  upiTransactionId: { type: String, default: '' },
  amount:      { type: Number, default: 0 },
  currency:    { type: String, default: 'INR' },
  activatedAt: { type: Date },
  expiresAt:   { type: Date },
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ── Payment Router ─────────────────────────────────────────────────────
const paymentRouter = Router();

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

// POST /activate - Activate pro plan (after payment)
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
  // This will be populated by a preceding middleware
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
