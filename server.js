import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authRouter, authMiddleware, requireRole, User } from './auth.js';
import { validate, itemSchema as itemValidator, transactionSchema as txValidator } from './validators.js';
import { paymentRouter, attachSubscription } from './payments.js';

// Force Google DNS — fixes ISP/container SRV-record resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// ── CORS ───────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3002',
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ── MongoDB Connection ─────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notminelap-industries';

async function autoSeedAdmin() {
  try {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'notminelap';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '9334246278@';
    const existing = await User.findOne({ username: ADMIN_USERNAME.toLowerCase() });
    if (!existing) {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.default.hash(ADMIN_PASSWORD, 12);
      await User.create({ username: ADMIN_USERNAME.toLowerCase(), passwordHash: hash, role: 'admin' });
      console.log(`✅ Admin user '${ADMIN_USERNAME}' auto-seeded successfully!`);
    } else {
      console.log(`ℹ️ Admin user '${ADMIN_USERNAME}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Auto-seed error:', err.message);
  }
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    autoSeedAdmin();
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ── Schemas ────────────────────────────────────────────────────────────
const itemSchema = new mongoose.Schema({
  id:                { type: String, required: true, unique: true },
  model:             { type: String, required: true, trim: true },
  color:             { type: String, required: true, trim: true },
  description:       { type: String, default: '', trim: true },
  quantity:          { type: Number, required: true, min: 0, default: 0 },
  image:             { type: String, default: '' },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  itemId:        { type: String, required: true },
  type:          { type: String, enum: ['IN', 'OUT'], required: true },
  quantity:      { type: Number, required: true, min: 1 },
  partyName:     { type: String, required: true, trim: true },
  date:          { type: String, required: true },
  address:       { type: String, required: true, trim: true },
  billingNumber: { type: String, required: true, trim: true },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
const Item        = mongoose.model('Item', itemSchema);

// ── Helper ─────────────────────────────────────────────────────────────
const lean = doc => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
};

// ── Auth Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);

// ── REST Endpoints ─────────────────────────────────────────────────────
app.get('/api/inventory', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({}).lean();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Low-stock alerts — MUST be before /:id routes
app.get('/api/inventory/alerts', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).lean();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', authMiddleware, validate(itemValidator), async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(lean(item));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/inventory/:id', authMiddleware, validate(itemValidator.partial()), async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(lean(item));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/inventory/:id', authMiddleware, async (req, res) => {
  try {
    await Item.deleteOne({ id: req.params.id });
    await Transaction.deleteMany({ itemId: req.params.id });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Transaction Endpoints ──────────────────────────────────────────────
app.get('/api/inventory/:id/transactions', authMiddleware, async (req, res) => {
  try {
    const txs = await Transaction.find({ itemId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(txs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory/:id/transaction', authMiddleware, validate(txValidator), async (req, res) => {
  try {
    const { type, quantity, partyName, date, address, billingNumber } = req.body;
    const numQty = Number(quantity);

    // Check stock for OUT transactions
    if (type === 'OUT') {
      const current = await Item.findOne({ id: req.params.id }).lean();
      if (!current) return res.status(404).json({ error: 'Item not found' });
      if ((current.quantity || 0) < numQty) {
        return res.status(400).json({ error: 'Insufficient stock to fulfill transaction' });
      }
    }

    // Use $inc to atomically update quantity
    const delta = type === 'IN' ? numQty : -numQty;
    const updatedItem = await Item.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { quantity: delta } },
      { new: true }
    ).lean();
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });

    const tx = new Transaction({
      itemId:        req.params.id,
      type,
      quantity:      numQty,
      partyName,
      date,
      address,
      billingNumber,
    });
    await tx.save();

    res.status(201).json({ item: updatedItem, transaction: lean(tx) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── All transactions (activity feed) ── */
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.partyName = { $regex: req.query.search, $options: 'i' };
    }

    const [txs, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);
    const itemIds = [...new Set(txs.map(t => t.itemId))];
    const items = await Item.find({ id: { $in: itemIds } }).lean();
    const map = Object.fromEntries(items.map(i => [i.id, i]));
    res.json({
      transactions: txs.map(tx => ({ ...tx, itemModel: map[tx.itemId]?.model, itemColor: map[tx.itemId]?.color })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── User Management (Admin only) ──────────────────────────────────────
app.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').lean();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (role && !['admin', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin Dashboard Stats (Admin only) ──────────────────────────────────
app.get('/api/admin/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [totalItems, totalUsers, totalTransactions, recentUsers, subscriptions] = await Promise.all([
      Item.countDocuments({}),
      User.countDocuments({}),
      Transaction.countDocuments({}),
      User.find({}).select('-passwordHash').sort({ createdAt: -1 }).limit(20).lean(),
      // Import Subscription from payments.js is already available via attachSubscription
      mongoose.connection.db.collection('subscriptions').find({}).toArray().catch(() => []),
    ]);

    const lowStockItems = await Item.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).lean();

    res.json({
      totalItems,
      totalUsers,
      totalTransactions,
      lowStockCount: lowStockItems.length,
      recentUsers: recentUsers.map(u => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
      })),
      proUsers: subscriptions.filter(s => s.plan === 'pro' && s.status === 'active').length,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Serve built frontend (production) ─────────────────────────────────
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')));

// ── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
  });
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notminelap Industries server running on port ${PORT}`);
});
