'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HeartHandshake, CheckCircle2, MessageSquare, Clock, Tag, ArrowLeft, Send, User, Edit3, Trash2, X, AlertCircle, Save } from 'lucide-react';
import { getRequestById, offerHelp, markSolved, addMessage, updateHelpRequest, deleteHelpRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDialog } from '@/context/DialogContext';
import Link from 'next/link';

interface Helper {
  _id: string;
  name: string;
  trustScore: number;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  text: string;
  createdAt: string;
}

interface RequestData {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  urgency: string;
  status: string;
  requester: { _id: string; name: string; skills: string[]; trustScore: number };
  helpers: Helper[];
  messages: Message[];
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function RequestDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const id = params.id as string;

  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [offeringHelp, setOfferingHelp] = useState(false);
  const [solving, setSolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    urgency: ''
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    // Dummy data mapping for guest preview
    const DUMMY_DATA_MAP: Record<string, RequestData> = {
      '1': { _id: '1', title: 'Connect MongoDB to Next.js', description: 'I am trying to setup a connection between my Next.js API routes and a MongoDB Atlas cluster. I keep getting timeout errors.', category: 'Backend', tags: ['MongoDB', 'Next.js'], urgency: 'high', status: 'solved', requester: { _id: 'u1', name: 'James Clear', skills: ['React'], trustScore: 450 }, helpers: [{ _id: 'h1', name: 'Helper Pro', trustScore: 1200 }], messages: [], createdAt: new Date().toISOString() },
      '2': { _id: '2', title: 'Center a div with Tailwind', description: 'What is the best way to center a div both horizontally and vertically using Tailwind CSS utility classes?', category: 'Frontend', tags: ['CSS', 'Tailwind'], urgency: 'medium', status: 'open', requester: { _id: 'u2', name: 'Elena Gilbert', skills: ['Design'], trustScore: 820 }, helpers: [], messages: [], createdAt: new Date().toISOString() },
    };

    setLoading(true);
    try {
      if (DUMMY_DATA_MAP[id]) {
        setRequest(DUMMY_DATA_MAP[id]);
      } else {
        const data = await getRequestById(id);
        setRequest(data);
        setEditData({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags.join(', '),
          urgency: data.urgency
        });
      }
    } catch (err) {
      console.error('Error fetching request detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferHelp = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setOfferingHelp(true);
    try {
      await offerHelp(id);
      showToast('Help offer sent successfully!', 'success');
      await loadRequest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to offer help';
      showToast(msg, 'error');
    } finally {
      setOfferingHelp(false);
    }
  };

  const handleMarkSolved = async (helperId?: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSolving(true);
    try {
      await markSolved(id, helperId);
      showToast('Request marked as solved! Trust scores updated.', 'success');
      await refreshUser();
      await loadRequest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark as solved';
      showToast(msg, 'error');
    } finally {
      setSolving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sendingMessage) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setSendingMessage(true);
    try {
      await addMessage(id, message);
      setMessage('');
      await loadRequest(); // Reload to get new messages
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      showToast(msg, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Request?',
      message: 'Are you sure you want to delete this request? This action cannot be undone and you will lose all progress.',
      confirmText: 'Delete Permanently',
      cancelText: 'Keep Request'
    });
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteHelpRequest(id);
      showToast('Request deleted successfully', 'success');
      router.push('/feed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete request', 'error');
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateHelpRequest(id, {
        ...editData,
        tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      showToast('Request updated successfully', 'success');
      setShowEditModal(false);
      await loadRequest();
    } catch (err: any) {
      showToast(err.message || 'Failed to update request', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '2.5rem', borderRadius: '100px' }}></div>
        <div className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="glass-card skeleton" style={{ height: '350px', borderRadius: '24px' }}></div>
            <div className="glass-card skeleton" style={{ height: '450px', borderRadius: '24px' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div className="glass-card skeleton" style={{ height: '180px', borderRadius: '24px' }}></div>
            <div className="glass-card skeleton" style={{ height: '280px', borderRadius: '24px' }}></div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          @media (min-width: 1024px) {
            .detail-grid {
              grid-template-columns: 2fr 1fr;
              gap: 3rem;
            }
          }
          .skeleton {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
          }
          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}} />
      </div>
    );
  }

  if (!request) return <div className="container" style={{ padding: '3rem 2rem', textAlign: 'center', fontSize: '1.2rem', color: '#64748b' }}>Request not found.</div>;

  const isOwner = user?.id === request.requester?._id;

  return (
    <div className="container animate-fade-in-up detail-page-container">
      <Link href="/feed" className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', textDecoration: 'none', marginBottom: '2.5rem', width: 'fit-content', fontWeight: '700', transition: 'all 0.3s ease' }}>
        <ArrowLeft size={20} /> Back to Community Feed
      </Link>

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Main Content */}
          <div className="glass-card content-card" style={{ background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.04)' }}>
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
              <h1 className="heading-lg request-title" style={{ marginBottom: 0, color: '#0f172a' }}>{request.title}</h1>
              <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                {isOwner && request.status !== 'solved' && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginRight: '1rem' }}>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      style={{ padding: '0.6rem', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                      title="Edit Request"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                      title="Delete Request"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <span className="badge" style={{ 
                  background: request.urgency === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                  color: request.urgency === 'critical' ? 'var(--danger)' : 'var(--primary)',
                  border: `1px solid ${request.urgency === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`,
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {request.urgency.toUpperCase()} URGENCY
                </span>
              </div>
            </div>
            
            <div className="meta-bar" style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: '#64748b', fontSize: '0.95rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <span style={{ color: '#1e293b', fontWeight: '700' }}>{request.requester?.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '500' }}><Clock size={18} /> {timeAgo(request.createdAt)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '500' }}><Tag size={18} /> {request.category}</div>
            </div>

            <div style={{ fontSize: '1.15rem', lineHeight: '2', color: '#334155', marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
              {request.description}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {request.tags.map(tag => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--primary)', background: 'rgba(5, 150, 105, 0.08)', padding: '0.5rem 1.25rem', borderRadius: '100px', fontWeight: '600', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                  <Tag size={14} /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Discussion */}
          <div className="glass-card content-card" style={{ background: 'white' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
              <MessageSquare size={24} style={{ color: 'var(--primary)' }} /> Discussion ({request.messages?.length || 0})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' }}>
              {request.messages?.map((msg) => (
                <div key={msg._id} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <User size={24} style={{ color: '#64748b' }} />
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0 24px 24px 24px', flex: 1, border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>{msg.sender?.name}</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '1rem' }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              {(!request.messages || request.messages.length === 0) && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '24px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                   <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                   <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isAuthenticated ? 'Type your message...' : 'Sign in to message...'}
                style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none', paddingLeft: '1.5rem' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '56px', height: '56px', padding: 0, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)' }}
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
              >
                {sendingMessage ? '...' : <Send size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {request.status !== 'solved' && (!user || user.role !== 'need_help') && (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'white', boxShadow: '0 40px 100px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <HeartHandshake size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', color: '#0f172a' }}>Want to help?</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>Earn trust points and build your reputation by resolving this request!</p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '100px', fontSize: '1.05rem', fontWeight: '700' }}
                onClick={handleOfferHelp}
                disabled={offeringHelp}
              >
                <HeartHandshake size={20} /> {offeringHelp ? 'Sending...' : 'Offer Assistance'}
              </button>
            </div>
          )}

          <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={20} style={{ color: 'var(--primary)' }} /> Helpers ({request.helpers?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {request.helpers?.map(helper => (
                <div key={helper._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.2)' }}>
                      {helper.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{helper.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>Score: {helper.trustScore}</p>
                    </div>
                  </div>
                  {isOwner && request.status !== 'solved' && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '100px', fontWeight: '700', background: 'white' }}
                      onClick={() => handleMarkSolved(helper._id)}
                    >
                      Verify
                    </button>
                  )}
                </div>
              ))}
              {(!request.helpers || request.helpers.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', background: '#f8fafc', borderRadius: '20px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                   <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>No helpers yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.75rem', color: '#0f172a' }}>Requester Profile</h3>
            <div style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} style={{ color: '#64748b' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{request.requester?.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>Trust Score: {request.requester?.trustScore}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {request.requester?.skills?.map(skill => (
                  <span key={skill} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: 'white', borderRadius: '100px', color: '#475569', fontWeight: '600', border: '1px solid rgba(0,0,0,0.05)' }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .detail-page-container { padding: 2rem 1rem; }
        .detail-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        .content-card { padding: 1.5rem; }
        .request-title { fontSize: 1.75rem; line-height: 1.2; }
        
        @media (min-width: 768px) {
          .detail-page-container { padding: 3rem 2rem; }
          .content-card { padding: 2.5rem; }
          .request-title { fontSize: 2.25rem; }
        }

        @media (min-width: 1024px) {
          .detail-grid { grid-template-columns: 2fr 1fr; gap: 3rem; }
          .content-card { padding: 3rem; }
          .request-title { fontSize: 2.5rem; }
        }

        @media (max-width: 640px) {
          .content-header { flex-direction: column; }
          .header-actions { width: 100%; justify-content: space-between; }
          .meta-bar { gap: 1rem; }
        }

        .badge-resolved { background: rgba(16, 185, 129, 0.08); color: var(--success); border-color: rgba(16, 185, 129, 0.15); }
        .btn-back:hover { color: var(--primary) !important; transform: translateX(-8px); }

        .edit-modal-content {
          width: 100%;
          maxWidth: 700px;
          padding: 1.5rem;
          background: white;
          boxShadow: 0 40px 100px rgba(0,0,0,0.2);
        }

        @media (min-width: 768px) {
          .edit-modal-content { padding: 3.5rem; }
          .modal-grid { grid-template-columns: 1fr 1fr; }
        }
        
        .modal-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
      `}} />

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setShowEditModal(false)}
        >
          <div className="glass-card animate-fade-in-up edit-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 className="heading-lg" style={{ marginBottom: 0, fontSize: '2.25rem' }}>Edit Help Request</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Request Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editData.title} 
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  style={{ background: '#f8fafc', border: '2px solid var(--primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Detailed Description</label>
                <textarea 
                  className="form-input" 
                  value={editData.description} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  style={{ minHeight: '150px', resize: 'vertical', background: '#f8fafc', border: '2px solid var(--primary)' }} 
                />
              </div>
              <div className="modal-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Category</label>
                  <select 
                    className="form-input form-select" 
                    value={editData.category} 
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    style={{ background: '#f8fafc', border: '2px solid var(--primary)' }}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Design">Design</option>
                    <option value="Database">Database</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Urgency Level</label>
                  <select 
                    className="form-input form-select" 
                    value={editData.urgency} 
                    onChange={(e) => setEditData({...editData, urgency: e.target.value})}
                    style={{ background: '#f8fafc', border: '2px solid var(--primary)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editData.tags} 
                  onChange={(e) => setEditData({...editData, tags: e.target.value})} 
                  style={{ background: '#f8fafc', border: '2px solid var(--primary)' }}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding: '1.4rem', marginTop: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} disabled={updating}>
                {updating ? 'Saving...' : <><Save size={20} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
