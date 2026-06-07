'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Award, Clock, Star, Edit3, HeartHandshake, BookOpen, Save, X, MapPin, Briefcase, Camera } from 'lucide-react';
import { fetchMe, updateProfile } from '@/lib/api';
import GuestOverlay from '@/components/GuestOverlay';
import { useToast } from '@/context/ToastContext';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location: string;
  trustScore: number;
  createdAt?: string;
}

const AVATAR_VARIANTS = [0, 1, 2, 3, 4, 5];

export default function Profile() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    skills: '',
    interests: '',
    avatar: ''
  });

  const DUMMY_PROFILE: UserProfile = {
    _id: 'guest',
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'both',
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=GuestUser`,
    bio: 'Exploring the platform as a guest. I love helping people with tech issues.',
    skills: ['React', 'Node.js', 'UI Design'],
    interests: ['Open Source', 'Mentorship', 'Web3'],
    location: 'Global',
    trustScore: 45,
    createdAt: new Date().toISOString()
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setProfile(DUMMY_PROFILE);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const data = await fetchMe();
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        location: data.location || '',
        skills: (data.skills || []).join(', '),
        interests: (data.interests || []).join(', '),
        avatar: data.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.name}`
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        interests: formData.interests.split(',').map(s => s.trim()).filter(s => s !== ''),
        avatar: formData.avatar
      });
      await refreshUser();
      await loadProfile();
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="container" style={{ padding: '4rem 2rem' }}>
        <div className="glass-card skeleton" style={{ height: '300px', marginBottom: '2rem' }}></div>
        <div className="skeleton-grid">
          <div className="glass-card skeleton" style={{ height: '200px' }}></div>
          <div className="glass-card skeleton" style={{ height: '200px' }}></div>
          <div className="glass-card skeleton" style={{ height: '200px' }}></div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 28px; }
          @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .skeleton-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
          @media (min-width: 768px) { .skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
        `}} />
      </div>
    );
  }

  const currentAvatarUrl = isEditing ? formData.avatar : (profile?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.name || 'User'}`);

  return (
    <div className="container animate-fade-in-up profile-container" style={{ padding: '2rem 1rem' }}>
      <GuestOverlay show={!isAuthenticated} message="You are viewing a guest profile. Sign in to customize your own!">
        
        {/* Header Card */}
        <div className="glass-card profile-header-card" style={{ background: 'white', position: 'relative', overflow: 'hidden', marginBottom: '3rem' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '150px', background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(99, 102, 241, 0.05))', zIndex: 0 }}></div>
          
          <div className="profile-header-content" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '2rem', marginTop: '60px', flexWrap: 'wrap' }}>
            <div className="avatar-section" style={{ position: 'relative' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'white', padding: '6px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'all 0.5s ease' }}>
                  <img src={currentAvatarUrl} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isEditing && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: '50%' }}>
                      <Camera size={32} />
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <Edit3 size={16} />
                </div>
              )}
            </div>
            
            <div className="info-section" style={{ flex: 1, minWidth: '280px' }}>
              <div className="info-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ minWidth: '200px' }}>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input"
                      style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', width: '100%', marginBottom: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '2px solid var(--primary)' }}
                    />
                  ) : (
                    <h1 className="heading-lg" style={{ marginBottom: '0.2rem', fontSize: '2.5rem' }}>{profile?.name}</h1>
                  )}
                  <p style={{ color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} /> {profile?.email}
                  </p>
                </div>
                
                <div className="profile-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {isAuthenticated && (
                    isEditing ? (
                      <>
                        <button className="btn" onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                          <X size={18} /> Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                          <Save size={18} /> Save Changes
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                        <Edit3 size={18} /> Edit Profile
                      </button>
                    )
                  )}
                  
                  {!isEditing && (
                    <div className="trust-badge" style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(217, 119, 6, 0.08)', borderRadius: '24px', border: '1px solid rgba(217, 119, 6, 0.1)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Trust Score</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '2rem', fontWeight: '800', color: '#b45309', fontFamily: 'var(--font-heading)' }}>
                        <Star fill="var(--secondary)" size={24} color="var(--secondary)" /> {profile?.trustScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-main-grid" style={{ display: 'grid', gap: '2.5rem' }}>
          
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {isEditing && (
              <div className="glass-card" style={{ padding: '2rem', background: 'white', border: '1px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} style={{ color: 'var(--primary)' }} /> Choose Avatar
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {AVATAR_VARIANTS.map((variantIndex) => {
                    const seedBase = formData.name || profile?.name || 'User';
                    const seed = variantIndex === 0 ? seedBase : `${seedBase}-${variantIndex}`;
                    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
                    return (
                      <div 
                        key={variantIndex}
                        onClick={() => setFormData({...formData, avatar: avatarUrl})}
                        style={{ 
                          width: '100%', 
                          aspectRatio: '1/1', 
                          borderRadius: '16px', 
                          background: '#f8fafc', 
                          cursor: 'pointer',
                          border: formData.avatar === avatarUrl ? '4px solid var(--primary)' : '2px solid rgba(0,0,0,0.05)',
                          boxShadow: formData.avatar === avatarUrl ? '0 0 15px var(--primary-glow)' : 'none',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <img src={avatarUrl} alt={`Avatar Variant ${variantIndex + 1}`} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-card" style={{ padding: '2rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--primary)' }} /> Profile Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Role</label>
                  <span className="badge badge-resolved">{profile?.role.replace('_', ' ')}</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="form-input"
                      style={{ border: '2px solid var(--primary)', background: '#f8fafc' }}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--primary)" /> {profile?.location || 'Not specified'}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Member Since</label>
                  <p style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="var(--primary)" /> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={22} style={{ color: 'var(--primary)' }} /> About Me
              </h3>
              {isEditing ? (
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="form-input"
                  style={{ width: '100%', minHeight: '120px', border: '2px solid var(--primary)', background: '#f8fafc' }}
                  placeholder="Tell us a bit about yourself..."
                />
              ) : (
                <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {profile?.bio || 'No bio provided yet. Add one to let others know more about you!'}
                </p>
              )}
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={22} style={{ color: 'var(--primary)' }} /> Skills & Expertise
              </h3>
              {isEditing ? (
                <div>
                  <input 
                    type="text" 
                    value={formData.skills} 
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="form-input"
                    style={{ border: '2px solid var(--primary)', background: '#f8fafc', marginBottom: '1rem' }}
                    placeholder="e.g. React, Python, Teaching (comma separated)"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {formData.skills.split(',').map(s => s.trim()).filter(s => s !== '').map((skill, i) => (
                      <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span key={index} style={{ padding: '0.6rem 1.2rem', background: 'rgba(5, 150, 105, 0.08)', color: 'var(--primary)', borderRadius: '100px', fontWeight: '600', fontSize: '0.95rem', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No skills listed yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartHandshake size={22} style={{ color: 'var(--secondary)' }} /> Interests
              </h3>
              {isEditing ? (
                <div>
                  <input 
                    type="text" 
                    value={formData.interests} 
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="form-input"
                    style={{ border: '2px solid var(--secondary)', background: '#fffbeb', marginBottom: '1rem' }}
                    placeholder="e.g. AI, Hiking, Cooking (comma separated)"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {formData.interests.split(',').map(s => s.trim()).filter(s => s !== '').map((interest, i) => (
                      <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--secondary)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {profile?.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, index) => (
                      <span key={index} style={{ padding: '0.6rem 1.2rem', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--secondary)', borderRadius: '100px', fontWeight: '600', fontSize: '0.95rem', border: '1px solid rgba(217, 119, 6, 0.1)' }}>
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No interests listed yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </GuestOverlay>

      <style dangerouslySetInnerHTML={{ __html: `
        .profile-main-grid { grid-template-columns: 1fr; }
        .profile-header-card { padding: 2rem; }
        .profile-header-content { align-items: center; flex-direction: column; text-align: center; }
        .info-header-flex { justify-content: center; }
        .profile-actions { justify-content: center; width: 100%; }
        .trust-badge { width: 100%; }

        @media (min-width: 768px) {
          .profile-container { padding: 4rem 2rem !important; }
          .profile-header-card { padding: 3rem; }
          .profile-header-content { align-items: flex-end; flex-direction: row; text-align: left; }
          .info-header-flex { justify-content: space-between; }
          .profile-actions { justify-content: flex-end; width: auto; }
          .trust-badge { width: auto; }
        }

        @media (min-width: 1024px) {
          .profile-main-grid { grid-template-columns: 1fr 2fr; }
        }

        @media (max-width: 480px) {
          .profile-actions button { width: 100%; }
          .heading-lg { font-size: 2rem !important; }
        }
      `}} />
    </div>
  );
}
