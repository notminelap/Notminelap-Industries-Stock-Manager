import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfect-ergonomics';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'notminelap';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '9334246278@';

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ username: ADMIN_USERNAME.toLowerCase() });
    if (existing) {
      console.log(`Admin user '${ADMIN_USERNAME}' already exists. Skipping.`);
    } else {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({ username: ADMIN_USERNAME.toLowerCase(), passwordHash: hash, role: 'admin' });
      console.log(`✅ Admin user '${ADMIN_USERNAME}' created successfully!`);
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
