'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Mail, Lock } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in-up login-page-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card login-card" style={{ width: '100%', maxWidth: '520px', background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' }}>
        <div className="login-header" style={{ textAlign: 'center' }}>
          <h1 className="heading-lg login-title" style={{ marginBottom: '0.75rem' }}>Welcome Back</h1>
          <p className="text-muted login-subtitle">Enter your credentials to access your dashboard.</p>
        </div>
        
        {serverError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2.5rem', color: 'var(--danger)', fontSize: '0.95rem', fontWeight: '500' }}>
            <AlertCircle size={20} /> {serverError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Mail size={18} style={{ color: 'var(--primary)' }} /> Email Address
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'border-danger' : ''}`}
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              style={{ background: '#f8fafc' }}
            />
            {errors.email && <span className="form-error"><AlertCircle size={14} /> {errors.email}</span>}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} /> Password
            </label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'border-danger' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={{ background: '#f8fafc' }}
            />
            {errors.password && <span className="form-error"><AlertCircle size={14} /> {errors.password}</span>}
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '1.4rem', fontSize: '1.1rem' }} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '1.05rem' }}>
          Don&apos;t have an account yet? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Create Account</Link>
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .login-page-wrapper { padding: 3rem 1rem; }
        .login-card { padding: 2rem 1.5rem; }
        .login-header { margin-bottom: 2.5rem; }
        .login-title { font-size: 2rem; }
        .login-subtitle { font-size: 0.95rem; }

        @media (min-width: 640px) {
          .login-page-wrapper { padding: 6rem 2rem; }
          .login-card { padding: 4rem; }
          .login-header { margin-bottom: 3.5rem; }
          .login-title { font-size: 2.5rem; }
          .login-subtitle { font-size: 1.05rem; }
        }

        @media (max-width: 480px) {
          .login-page-wrapper { padding: 2rem 0.5rem; }
          .login-card { padding: 2rem 1rem; border-radius: 20px; }
          .login-title { font-size: 1.75rem; }
          .login-subtitle { font-size: 0.9rem; }
          .btn-primary { padding: 1.1rem !important; font-size: 1rem !important; }
        }

        .border-danger { border-color: var(--danger) !important; }
      `}} />
    </div>
  );
}
