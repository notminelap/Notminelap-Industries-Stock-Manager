import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Package, Crown, ArrowRight, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiPost, getStoredUser } from '../utils/api';

const sp = { type: 'spring', bounce: 0.3, duration: 0.5 };

export default function Pricing() {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = getStoredUser();

  const UPI_ID = 'radheshranvijay@fam';
  const UPI_LINK = `upi://pay?pa=${UPI_ID}&pn=Notminelap%20Industries&am=100&cu=INR&tn=Pro%20Plan%20Subscription`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    if (!txnId.trim()) { toast.error('Please enter your UPI Transaction ID'); return; }
    if (!user) { toast.error('Please log in first'); navigate('/login'); return; }
    setLoading(true);
    try {
      await apiPost('/payments/activate', { upiTransactionId: txnId });
      toast.success('🎉 Pro plan activated!');
      setShowPayment(false);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Activation failed');
    } finally { setLoading(false); }
  };

  const free = ['Up to 50 inventory items', 'Basic dashboard', 'Transaction logging', 'Dark & Light mode', 'Single user'];
  const pro = ['Unlimited inventory items', 'Advanced analytics & charts', 'Barcode generation & printing', 'CSV import/export', 'Low-stock alert system', 'Multi-user team management', 'Priority support', 'All future features'];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f5f5f7', fontFamily: 'Inter, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Package size={20} color="#0071e3" strokeWidth={2.2} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.03em' }}>Notminelap Industries</span>
        </div>
        <button onClick={() => navigate(user ? '/' : '/login')} style={{
          background: '#0071e3', border: 'none', borderRadius: 999,
          color: '#fff', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.85rem', fontWeight: 600
        }}>{user ? 'Dashboard' : 'Sign In'}</button>
      </nav>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-1" style={{ position: 'absolute', top: '10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.15) 0%, transparent 60%)' }} />
        <div className="orb-2" style={{ position: 'absolute', bottom: '10%', right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '8rem 1.5rem 4rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', marginBottom: '1rem' }}>
            <Crown size={12} /> Simple Pricing
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '1rem 0 0.75rem' }}>
            Choose your plan.
          </h1>
          <p style={{ color: '#a1a1a6', fontSize: '1.15rem', fontWeight: 500, maxWidth: 600, margin: '0 auto' }}>
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>

          {/* FREE */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...sp }}
            style={{ background: '#111113', borderRadius: 28, border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '0.75rem 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>₹0</span>
                <span style={{ color: '#6e6e73', fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ color: '#6e6e73', fontSize: '0.9rem' }}>Perfect for getting started</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
              {free.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} color="#30d158" />
                  <span style={{ fontSize: '0.9rem', color: '#a1a1a6' }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(user ? '/' : '/register')} style={{
              width: '100%', padding: '14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
              background: 'none', color: '#f5f5f7', fontFamily: 'inherit', fontSize: '0.95rem',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>{user ? 'Current Plan' : 'Get Started'}</button>
          </motion.div>

          {/* PRO */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...sp }}
            style={{
              background: 'linear-gradient(135deg, rgba(0,113,227,0.08), rgba(168,85,247,0.06))',
              borderRadius: 28, border: '1px solid rgba(0,113,227,0.25)', padding: '2.5rem',
              display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              boxShadow: '0 0 80px rgba(0,113,227,0.08)'
            }}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(0,113,227,0.2)', color: '#3b9eff' }}>
                <Sparkles size={10} /> POPULAR
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b9eff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '0.75rem 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>₹100</span>
                <span style={{ color: '#6e6e73', fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ color: '#6e6e73', fontSize: '0.9rem' }}>For serious warehouse operations</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
              {pro.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} color="#3b9eff" />
                  <span style={{ fontSize: '0.9rem', color: '#d1d1d6' }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => user ? setShowPayment(true) : navigate('/register')} style={{
              width: '100%', padding: '14px', borderRadius: 999, border: 'none',
              background: '#0071e3', color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 0 30px rgba(0,113,227,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>Upgrade to Pro <ArrowRight size={16} /></button>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ y: 40, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ ...sp }}
              style={{ background: '#1d1d1f', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', maxWidth: 460, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Pay via UPI</h2>
                  <p style={{ color: '#a1a1a6', fontSize: '0.85rem', marginTop: 4 }}>Complete payment to activate Pro</p>
                </div>
                <button onClick={() => setShowPayment(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#a1a1a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Amount */}
              <div style={{ background: 'rgba(0,113,227,0.08)', borderRadius: 20, padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid rgba(0,113,227,0.15)' }}>
                <p style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em' }}>₹100</p>
                <p style={{ color: '#a1a1a6', fontSize: '0.85rem' }}>Pro Plan · 1 Month</p>
              </div>

              {/* UPI Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ background: '#2c2c2e', borderRadius: 16, padding: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Step 1: Pay to this UPI ID</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: '1.05rem', fontWeight: 700, color: '#3b9eff' }}>{UPI_ID}</code>
                    <button onClick={copyUPI} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#a1a1a6', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {copied ? <><CheckCircle2 size={12} color="#30d158" /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>
                <a href={UPI_LINK} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(48,209,88,0.1)', color: '#30d158', borderRadius: 14, padding: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(48,209,88,0.2)' }}>
                  Open in UPI App →
                </a>
              </div>

              {/* Step 2: Enter Transaction ID */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Step 2: Enter UPI Transaction ID</label>
                <input
                  value={txnId} onChange={e => setTxnId(e.target.value)}
                  placeholder="e.g. 412345678901"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 16, background: '#2c2c2e', border: '1.5px solid transparent', color: '#f5f5f7', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: '-0.01em' }}
                />
              </div>

              <button onClick={handleActivate} disabled={loading} style={{
                width: '100%', padding: '14px', borderRadius: 999, border: 'none',
                background: '#0071e3', color: '#fff', fontFamily: 'inherit', fontSize: '1rem',
                fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
              }}>{loading ? 'Activating...' : 'Activate Pro Plan'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
