import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPut, apiDelete } from '../utils/api';
import {
  Shield, Users, Package, Activity, ArrowLeft, Crown,
  Trash2, ChevronDown, AlertTriangle, X, BarChart3, UserCheck,
  TrendingUp, Database
} from 'lucide-react';

/* ─────────── helpers ─────────── */
const fmt = n => Number(n).toLocaleString('en-IN');
const fmtDate = ds => new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const sp = { type: 'spring', bounce: 0.3, duration: 0.5 };

/* ──── Animated Number Counter ──── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = React.useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = Number(value);
    prev.current = end;
    if (start === end) { setDisplay(end); return; }
    const duration = 1100;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{fmt(display)}</>;
}

/* ──── Confirmation Dialog ──── */
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: sp }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(28,28,30,0.95)', borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '2rem', maxWidth: 420, width: '100%',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
              <div style={{
                padding: 12, borderRadius: 16,
                background: 'rgba(255,69,58,0.12)', flexShrink: 0
              }}>
                <AlertTriangle size={24} color="#ff453a" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', marginBottom: 4, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} style={{
                flex: 1, padding: '12px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s'
              }}>Cancel</button>
              <button onClick={onConfirm} style={{
                flex: 1, padding: '12px 20px', borderRadius: 14,
                background: '#ff453a', border: 'none',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s'
              }}>Delete User</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──── Stat Card ──── */
function StatCard({ icon, label, value, subtitle, glowColor, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...sp, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: '#1c1c1e', borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem', position: 'relative', overflow: 'hidden',
        cursor: 'default', minHeight: 180
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', bottom: -50, right: -50,
        width: 200, height: 200, borderRadius: '50%',
        background: glowColor, opacity: 0.18, filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      {/* Secondary shimmer */}
      <div style={{
        position: 'absolute', top: -40, left: -40,
        width: 140, height: 140, borderRadius: '50%',
        background: glowColor, opacity: 0.06, filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', padding: 12, borderRadius: 18,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '1.25rem'
        }}>
          {icon}
        </div>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: 10
        }}>{label}</p>
        <p style={{
          fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1, color: '#fff'
        }}>
          <AnimatedNumber value={value} />
        </p>
        {subtitle && (
          <p style={{
            fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)',
            fontWeight: 500, marginTop: 10
          }}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ──── Role Badge ──── */
function RoleBadge({ role }) {
  const colors = {
    admin:   { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    manager: { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc', border: 'rgba(168,85,247,0.25)' },
    staff:   { bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' },
  };
  const c = colors[role] || colors.staff;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      background: c.bg, color: c.fg,
      border: `1px solid ${c.border}`
    }}>
      {role === 'admin' && <Crown size={10} />}
      {role === 'manager' && <Shield size={10} />}
      {role}
    </span>
  );
}


/* ══════════════════════════════════════════
   ADMIN PAGE
══════════════════════════════════════════ */
export default function Admin({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  /* ── fetch data ── */
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiGet('/users');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchStats, fetchUsers]);

  /* ── role change ── */
  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiPut(`/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId || u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  /* ── delete user ── */
  const requestDelete = (u) => setDeleteTarget(u);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const uid = deleteTarget._id || deleteTarget.id;
    setDeleteTarget(null);
    try {
      await apiDelete(`/users/${uid}`);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== uid));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  /* ── guard: admin only ── */
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const statCards = stats ? [
    {
      icon: <Package size={24} color="#3b9eff" />,
      label: 'Inventory Items', value: stats.totalItems || 0,
      subtitle: 'Total items in warehouse',
      glowColor: '#3b9eff'
    },
    {
      icon: <Users size={24} color="#a855f7" />,
      label: 'Registered Users', value: stats.totalUsers || 0,
      subtitle: 'Active platform users',
      glowColor: '#a855f7'
    },
    {
      icon: <Activity size={24} color="#30d158" />,
      label: 'Transactions', value: stats.totalTransactions || 0,
      subtitle: 'Total processed',
      glowColor: '#30d158'
    },
    {
      icon: <Crown size={24} color="#ff9f0a" />,
      label: 'Pro Subscribers', value: stats.proUsers || 0,
      subtitle: 'Premium members',
      glowColor: '#ff9f0a'
    },
    {
      icon: <AlertTriangle size={24} color="#ff453a" />,
      label: 'Low Stock Alerts', value: stats.lowStockCount || 0,
      subtitle: 'Items need restocking',
      glowColor: '#ff453a'
    },
  ] : [];

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      color: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden'
    }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.75rem',
        background: 'rgba(8,8,10,0.82)',
        backdropFilter: 'saturate(200%) blur(24px)',
        WebkitBackdropFilter: 'saturate(200%) blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Left: Back + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '6px 14px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem',
              fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s'
            }}
          >
            <ArrowLeft size={14} />
            Dashboard
          </motion.button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#3b9eff" strokeWidth={2.2} />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.03em' }}>
              Notminelap Industries
            </span>
          </div>
        </div>

        {/* Right: Admin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 12, padding: '5px 14px'
          }}>
            <Crown size={13} color="#60a5fa" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '-0.01em' }}>
              Admin Panel
            </span>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b9eff, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: '#fff'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </nav>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ paddingTop: 52, maxWidth: 1400, margin: '0 auto', padding: '84px 2rem 4rem' }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.05 }}
          style={{ marginBottom: '3rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)',
              fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <Database size={10} /> System Overview
            </div>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
            letterSpacing: '-0.05em', lineHeight: 1, margin: '0.5rem 0 0.75rem'
          }}>
            Admin{' '}
            <span style={{
              background: 'linear-gradient(120deg, #3b9eff 0%, #a855f7 45%, #30d158 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Dashboard
            </span>
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)',
            fontWeight: 500, letterSpacing: '-0.01em', maxWidth: 500
          }}>
            Monitor system health, manage users, and oversee platform operations.
          </p>
        </motion.div>

        {/* ── Loading State ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '6rem 0', gap: '1.5rem'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.06)',
                borderTopColor: '#3b9eff'
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 500 }}>
              Loading admin data...
            </p>
          </motion.div>
        )}

        {!loading && (
          <>
            {/* ── Stat Cards Grid ── */}
            <motion.div
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem', marginBottom: '3rem'
              }}
            >
              {statCards.map((card, index) => (
                <StatCard key={card.label} {...card} index={index} />
              ))}
            </motion.div>

            {/* ── User Management Section ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sp, delay: 0.4 }}
            >
              {/* Section Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <UserCheck size={20} color="#a855f7" />
                    <h2 style={{
                      fontSize: '1.5rem', fontWeight: 800,
                      letterSpacing: '-0.03em', color: '#fff'
                    }}>User Management</h2>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    {users.length} registered user{users.length !== 1 ? 's' : ''} on the platform
                  </p>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 12,
                  background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.15)'
                }}>
                  <TrendingUp size={13} color="#30d158" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#30d158' }}>
                    {users.filter(u => u.role === 'admin').length} Admin{users.filter(u => u.role === 'admin').length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Table Container */}
              <div style={{
                background: 'rgba(28,28,30,0.8)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 0.5fr',
                  padding: '1rem 1.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  {['Username', 'Role', 'Join Date', 'Change Role', ''].map(h => (
                    <span key={h} style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}>{h}</span>
                  ))}
                </div>

                {/* Table Rows */}
                {users.length === 0 ? (
                  <div style={{
                    padding: '3rem', textAlign: 'center',
                    color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem'
                  }}>
                    No users found.
                  </div>
                ) : (
                  <div>
                    {users.map((u, idx) => {
                      const uid = u._id || u.id;
                      const isSelf = uid === (user?._id || user?.id);
                      return (
                        <motion.div
                          key={uid || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onMouseEnter={() => setHoveredRow(uid)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 0.5fr',
                            padding: '1rem 1.75rem',
                            alignItems: 'center',
                            borderBottom: idx < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            background: hoveredRow === uid ? 'rgba(255,255,255,0.03)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          {/* Username */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: isSelf
                                ? 'linear-gradient(135deg, #3b9eff, #a855f7)'
                                : 'rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0
                            }}>
                              {u.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', letterSpacing: '-0.01em' }}>
                                {u.username}
                              </span>
                              {isSelf && (
                                <span style={{
                                  marginLeft: 8, fontSize: '0.65rem', fontWeight: 600,
                                  color: '#3b9eff', background: 'rgba(59,158,255,0.1)',
                                  padding: '2px 7px', borderRadius: 6
                                }}>You</span>
                              )}
                              {u.email && (
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                  {u.email}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Role Badge */}
                          <div>
                            <RoleBadge role={u.role || 'staff'} />
                          </div>

                          {/* Join Date */}
                          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                            {u.createdAt ? fmtDate(u.createdAt) : u.joinDate ? fmtDate(u.joinDate) : '—'}
                          </span>

                          {/* Role Selector */}
                          <div>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={u.role || 'staff'}
                                onChange={(e) => handleRoleChange(uid, e.target.value)}
                                disabled={isSelf}
                                style={{
                                  appearance: 'none', WebkitAppearance: 'none',
                                  background: isSelf ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: 10, padding: '7px 32px 7px 12px',
                                  color: isSelf ? 'rgba(255,255,255,0.25)' : '#fff',
                                  fontSize: '0.8rem', fontWeight: 600,
                                  fontFamily: 'inherit', cursor: isSelf ? 'not-allowed' : 'pointer',
                                  outline: 'none', transition: 'all .2s',
                                  minWidth: 110
                                }}
                                onFocus={e => { if (!isSelf) e.target.style.borderColor = 'rgba(59,158,255,0.4)'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                              >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="staff">Staff</option>
                              </select>
                              <ChevronDown size={13} style={{
                                position: 'absolute', right: 10, top: '50%',
                                transform: 'translateY(-50%)',
                                color: isSelf ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                                pointerEvents: 'none'
                              }} />
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {!isSelf ? (
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => requestDelete(u)}
                                style={{
                                  background: 'rgba(255,69,58,0.08)',
                                  border: '1px solid rgba(255,69,58,0.15)',
                                  borderRadius: 10, padding: 8,
                                  cursor: 'pointer', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  color: '#ff453a', transition: 'all .2s'
                                }}
                                title="Delete user"
                              >
                                <Trash2 size={15} />
                              </motion.button>
                            ) : (
                              <div style={{ width: 33 }} />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Footer ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                textAlign: 'center', padding: '3rem 0 2rem',
                color: 'rgba(255,255,255,0.15)', fontSize: '0.78rem',
                fontWeight: 500
              }}
            >
              Notminelap Industries · Admin Panel · {new Date().getFullYear()}
            </motion.div>
          </>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteTarget?.username}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Global dark select styles */}
      <style>{`
        select option {
          background: #1c1c1e;
          color: #fff;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
