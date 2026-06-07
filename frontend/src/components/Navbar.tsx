'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar-main">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          Helplytics
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: '2.5rem' }}>
          <Link href="/feed" style={{ fontWeight: '600', color: '#475569', transition: 'all 0.3s ease', fontSize: '0.95rem' }} className="nav-link">Explore</Link>
          <Link href="/dashboard" style={{ fontWeight: '600', color: '#475569', transition: 'all 0.3s ease', fontSize: '0.95rem' }} className="nav-link">Dashboard</Link>
          <Link href="/leaderboard" style={{ fontWeight: '600', color: '#475569', transition: 'all 0.3s ease', fontSize: '0.95rem' }} className="nav-link">Leaderboard</Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(5, 150, 105, 0.08)', padding: '0.4rem 0.6rem 0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(5, 150, 105, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="user-menu-btn"
                >
                  <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>{user?.name?.split(' ')[0]}</span>
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)', background: 'white' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem' 
                    }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {showDropdown && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setShowDropdown(false)}></div>
                    <div className="glass-card animate-fade-in-up" style={{ position: 'absolute', top: '120%', right: 0, padding: '1.25rem', minWidth: '220px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                      <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{user?.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{user?.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '700', background: 'rgba(217, 119, 6, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '100px', width: 'fit-content' }}>
                          Trust Score: {user?.trustScore || 0}
                        </div>
                      </div>
                      <Link href="/profile" onClick={() => setShowDropdown(false)} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}>
                        <User size={16} /> My Profile
                      </Link>
                      <button
                        onClick={() => { setShowDropdown(false); handleLogout(); }}
                        className="dropdown-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left' }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/login" className="btn-link">
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '100px', fontWeight: '700' }}>Sign In</button>
              </Link>
              <Link href="/register" className="btn-link">
                <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '100px', fontWeight: '700' }}>Join Free</button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar-mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#475569' }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="navbar-mobile-menu">
            {/* Nav Links */}
            <Link href="/feed" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: '600', color: '#475569', fontSize: '0.95rem', transition: 'all 0.2s' }} className="mobile-nav-link">
              Explore
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: '600', color: '#475569', fontSize: '0.95rem', transition: 'all 0.2s' }} className="mobile-nav-link">
              Dashboard
            </Link>
            <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: '600', color: '#475569', fontSize: '0.95rem', transition: 'all 0.2s' }} className="mobile-nav-link">
              Leaderboard
            </Link>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />

            {/* Auth Section */}
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{user?.name}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email}</p>
                  </div>
                </div>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }} className="mobile-nav-link">
                  <User size={16} /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: '600', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left' }}
                  className="mobile-nav-link"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-link">
                  <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '12px', fontWeight: '700' }}>Sign In</button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-link">
                  <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', fontWeight: '700' }}>Join Free</button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .nav-link:hover { color: var(--primary) !important; transform: translateY(-1px); }
        .user-menu-btn:hover { background: rgba(5, 150, 105, 0.12) !important; }
        .dropdown-item:hover { background: #f8fafc !important; }
        .mobile-nav-link:hover { background: #f8fafc !important; color: var(--primary) !important; }
        .btn-link { flex: 1; }

        .navbar-wrapper {
          padding: 1rem; /* Default mobile padding */
          display: flex;
          justify-content: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem; /* Default mobile padding */
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 100px;
          width: 100%;
          max-width: 100%; /* Full width on mobile */
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .navbar-logo {
          font-family: var(--font-heading);
          font-size: 1.4rem; /* Smaller on mobile */
          font-weight: 800;
          background: linear-gradient(to right, #059669, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.04em;
          flex-shrink: 0;
        }

        .desktop-nav-links, .desktop-auth {
          display: none !important; /* Hidden by default on mobile */
        }

        .navbar-mobile-btn {
          display: flex !important; /* Shown by default on mobile */
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #475569;
        }

        .dropdown-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
        }

        .navbar-mobile-menu {
          position: fixed;
          top: 90px; /* Adjust based on navbar height */
          left: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          z-index: 95;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: fadeInDown 0.3s ease-out;
        }

        .mobile-auth-buttons {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem 0;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tablet and Desktop styles */
        @media (min-width: 769px) {
          .navbar-wrapper {
            padding: 1.25rem 1.5rem;
          }
          .navbar-main {
            padding: 0.75rem 1.75rem;
            max-width: 1200px;
          }
          .navbar-logo {
            font-size: 1.6rem;
          }
          .desktop-nav-links, .desktop-auth {
            display: flex !important; /* Show desktop elements */
          }
          .navbar-mobile-btn, .navbar-mobile-menu {
            display: none !important; /* Hide mobile elements */
          }
        }
      `}} />
    </div>
  );
}
