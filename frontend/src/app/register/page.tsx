'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, User, Mail, Lock, Globe, Briefcase, Heart } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'both',
    skills: '',
    interests: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) newErrors.role = 'Please select a role';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in-up register-page-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card register-card" style={{ width: '100%', maxWidth: '800px', background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' }}>
        <div className="register-header" style={{ textAlign: 'center' }}>
          <h1 className="heading-lg register-title">Join the Community</h1>
          <p className="text-muted register-subtitle">Create your profile to start getting and offering help.</p>
        </div>

        {serverError && (
          <div className="register-error" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '1.25rem', borderRadius: '16px', color: 'var(--danger)', fontSize: '0.95rem', fontWeight: '500' }}>
            <AlertCircle size={20} /> {serverError}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="register-form" style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Full Name */}
          <div className="span-full">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <User size={18} style={{ color: 'var(--primary)' }} /> Full Name
            </label>
            <input 
              name="name"
              type="text" 
              className={`form-input ${errors.name ? 'border-danger' : ''}`} 
              placeholder="Enter your full name" 
              value={formData.name} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
            {errors.name && <span className="form-error"><AlertCircle size={14} /> {errors.name}</span>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Mail size={18} style={{ color: 'var(--primary)' }} /> Email Address
            </label>
            <input 
              name="email"
              type="email" 
              className={`form-input ${errors.email ? 'border-danger' : ''}`} 
              placeholder="john@example.com" 
              value={formData.email} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
            {errors.email && <span className="form-error"><AlertCircle size={14} /> {errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} /> Password
            </label>
            <input 
              name="password"
              type="password" 
              className={`form-input ${errors.password ? 'border-danger' : ''}`} 
              placeholder="Min 6 characters" 
              value={formData.password} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
            {errors.password && <span className="form-error"><AlertCircle size={14} /> {errors.password}</span>}
          </div>
          
          {/* Role Dropdown */}
          <div className="span-full">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Briefcase size={18} style={{ color: 'var(--primary)' }} /> Your Goal
            </label>
            <select 
              name="role"
              className={`form-input form-select ${errors.role ? 'border-danger' : ''}`} 
              value={formData.role} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            >
              <option value="both">Get Help &amp; Offer Help</option>
              <option value="need_help">I need help with projects</option>
              <option value="can_help">I want to help others</option>
            </select>
            {errors.role && <span className="form-error"><AlertCircle size={14} /> {errors.role}</span>}
          </div>

          {/* Skills */}
          <div className="span-full">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Briefcase size={18} style={{ color: 'var(--primary)' }} /> Skills (comma separated)
            </label>
            <input 
              name="skills"
              type="text" 
              className="form-input" 
              placeholder="React, Python, UI Design..." 
              value={formData.skills} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
          </div>

          {/* Interests */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Heart size={18} style={{ color: 'var(--primary)' }} /> Interests
            </label>
            <input 
              name="interests"
              type="text" 
              className="form-input" 
              placeholder="AI, Web3, Photography..." 
              value={formData.interests} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>
              <Globe size={18} style={{ color: 'var(--primary)' }} /> Location
            </label>
            <input 
              name="location"
              type="text" 
              className="form-input" 
              placeholder="City, Country" 
              value={formData.location} 
              onChange={handleChange}
              style={{ background: '#f8fafc' }}
            />
          </div>

          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1.5rem', padding: '1.4rem', fontSize: '1.1rem' }} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '1.05rem' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid var(--primary)' }}>Sign In</Link>
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .register-page-wrapper { padding: 2rem 1rem; }
        .register-card { padding: 2rem 1.5rem; }
        .register-header { marginBottom: 2.5rem; }
        .register-title { fontSize: 2rem; }
        .register-subtitle { fontSize: 0.95rem; }
        .register-error { grid-column: 1 / -1; marginBottom: 1.5rem; }
        .register-form { grid-template-columns: 1fr; }
        .register-form .btn-primary { grid-column: 1 / -1; }
        .span-full { grid-column: 1 / -1; }

        @media (min-width: 640px) {
          .register-form { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .register-header { marginBottom: 3.5rem; }
          .register-title { fontSize: 2.5rem; }
          .register-subtitle { fontSize: 1.05rem; }
          .register-card { padding: 4rem; }
          .register-page-wrapper { padding: 4rem 2rem; }
          .register-error { marginBottom: 2.5rem; }
          
          /* Ensure specific fields span full width on desktop */
          .span-full { grid-column: span 2; }
          .register-form .btn-primary { grid-column: span 2; }
        }

        @media (max-width: 480px) {
          .register-card { padding: 1.5rem 1rem; }
          .register-title { fontSize: 1.75rem; }
          .register-page-wrapper { padding: 1rem 0.5rem; }
        }

        .border-danger { border-color: var(--danger) !important; }
      `}} />
    </div>
  );
}
