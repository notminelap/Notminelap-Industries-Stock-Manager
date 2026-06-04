import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Zap, Shield, BarChart3, Users, ArrowRight, Sparkles, Globe, Lock, Layers } from 'lucide-react';

const sp = { type: 'spring', bounce: 0.3, duration: 0.5 };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f5f5f7', fontFamily: 'Inter, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={20} color="#0071e3" strokeWidth={2.2} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.03em' }}>Notminelap Industries</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
            color: '#f5f5f7', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s'
          }}>Sign In</button>
          <button onClick={() => navigate('/register')} style={{
            background: '#0071e3', border: 'none', borderRadius: 999,
            color: '#fff', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s'
          }}>Get Started Free</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 52, position: 'relative', overflow: 'hidden' }}>
        {/* Background effects */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="orb-1" style={{ position: 'absolute', top: '-15%', left: '15%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.25) 0%, transparent 60%)', filter: 'blur(2px)' }} />
          <div className="orb-2" style={{ position: 'absolute', top: '20%', right: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.18) 0%, transparent 60%)' }} />
          <div className="orb-3" style={{ position: 'absolute', bottom: '-10%', left: '40%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.12) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '8rem 1.5rem 6rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem',
              fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              background: 'rgba(0,113,227,0.15)', color: '#3b9eff', border: '1px solid rgba(0,113,227,0.2)'
            }}>
              <Sparkles size={12} /> Now Live — Version 2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...sp }}
            style={{ fontSize: 'clamp(3.2rem, 10vw, 8rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.92, margin: '1.5rem 0 1.2rem' }}
          >
            Inventory{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b9eff 0%, #a855f7 50%, #30d158 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#a1a1a6', fontWeight: 500, letterSpacing: '-0.02em', maxWidth: 700, margin: '0 auto 2.5rem', lineHeight: 1.5 }}
          >
            The most beautiful warehouse management platform ever built.
            Track inventory. Analyze trends. Generate barcodes. All in real-time.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0071e3', border: 'none', borderRadius: 999,
              color: '#fff', padding: '16px 32px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '1.05rem', fontWeight: 700, transition: 'all 0.2s',
              boxShadow: '0 0 40px rgba(0,113,227,0.3)'
            }}>Start Free <ArrowRight size={18} /></button>
            <button onClick={() => navigate('/pricing')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
              color: '#f5f5f7', padding: '16px 32px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '1.05rem', fontWeight: 600, transition: 'all 0.2s'
            }}>View Pricing</button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '1rem' }}>
            Everything you need.
            <br />
            <span style={{ color: '#a1a1a6' }}>Nothing you don't.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: '3rem' }}>
          {[
            { icon: <Zap size={24} color="#ff9f0a" />, title: 'Real-Time Tracking', desc: 'Every restock and dispatch logged instantly with atomic database operations. Zero data loss.', glow: 'rgba(255,159,10,0.15)' },
            { icon: <Shield size={24} color="#30d158" />, title: 'Bank-Grade Security', desc: 'JWT authentication, bcrypt password hashing, role-based access control, and rate-limited endpoints.', glow: 'rgba(48,209,88,0.15)' },
            { icon: <BarChart3 size={24} color="#3b9eff" />, title: 'Smart Analytics', desc: 'Stock distribution charts, trend analysis, low-stock alerts, and exportable CSV reports.', glow: 'rgba(59,158,255,0.15)' },
            { icon: <Users size={24} color="#a855f7" />, title: 'Team Collaboration', desc: 'Admin, Manager, and Staff roles. Full user management with granular permissions.', glow: 'rgba(168,85,247,0.15)' },
            { icon: <Globe size={24} color="#00d4ff" />, title: 'Access Anywhere', desc: 'Cloud-hosted 24/7 on Render. Works on desktop, tablet, and mobile. No installation needed.', glow: 'rgba(0,212,255,0.15)' },
            { icon: <Lock size={24} color="#ff453a" />, title: 'Data Integrity', desc: 'Strict MongoDB schemas with Zod validation. Every input sanitized. Every transaction atomic.', glow: 'rgba(255,69,58,0.15)' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, ...sp }}
              style={{
                background: '#111113', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)',
                padding: '2rem', position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.3s, transform 0.3s',
                cursor: 'default'
              }}
              whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: f.glow, filter: 'blur(50px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '1rem', padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.04)', display: 'inline-flex' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#a1a1a6', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.12) 0%, transparent 60%)', filter: 'blur(2px)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
            Ready to transform your warehouse?
          </h2>
          <p style={{ color: '#a1a1a6', fontSize: '1.15rem', marginBottom: '2rem', fontWeight: 500 }}>
            Join Notminelap Industries. Start free, upgrade anytime.
          </p>
          <button onClick={() => navigate('/register')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0071e3', border: 'none', borderRadius: 999,
            color: '#fff', padding: '18px 40px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '1.1rem', fontWeight: 700, transition: 'all 0.2s',
            boxShadow: '0 0 60px rgba(0,113,227,0.3)'
          }}>Get Started — It's Free <ArrowRight size={20} /></button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: '1rem'
      }}>
        <span style={{ color: '#6e6e73', fontSize: '0.85rem', fontWeight: 500 }}>© 2026 Notminelap Industries. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <span onClick={() => navigate('/pricing')} style={{ color: '#a1a1a6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Pricing</span>
          <span onClick={() => navigate('/login')} style={{ color: '#a1a1a6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Sign In</span>
        </div>
      </footer>
    </div>
  );
}
