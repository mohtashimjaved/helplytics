'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, HeartHandshake, Clock, Tag, Plus, X, AlertCircle } from 'lucide-react';
import { getRequests, createRequest, offerHelp } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import GuestOverlay from '@/components/GuestOverlay';

interface HelpRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  urgency: string;
  status: string;
  requester: { _id: string; name: string; trustScore: number };
  helpers: string[];
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

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create form state
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    category: 'Frontend',
    tags: '',
    urgency: 'medium',
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [offerLoadingId, setOfferLoadingId] = useState<string | null>(null);

  const DUMMY_REQUESTS: HelpRequest[] = [
    { _id: '1', title: 'React Performance Optimization', description: 'Need help with large list rendering...', category: 'Frontend', tags: ['React', 'WebPerf'], urgency: 'high', status: 'open', requester: { _id: '101', name: 'James Clear', trustScore: 450 }, helpers: [], createdAt: new Date().toISOString() },
    { _id: '2', title: 'Kubernetes Cluster Setup', description: 'Struggling with helm charts...', category: 'DevOps', tags: ['K8s', 'Docker'], urgency: 'critical', status: 'in-progress', requester: { _id: '102', name: 'Elena Gilbert', trustScore: 820 }, helpers: ['103'], createdAt: new Date().toISOString() },
    { _id: '3', title: 'GraphQL Schema Design', description: 'Best practices for nested types?', category: 'Backend', tags: ['GraphQL', 'API'], urgency: 'medium', status: 'open', requester: { _id: '104', name: 'Stefan Salvatore', trustScore: 310 }, helpers: [], createdAt: new Date().toISOString() },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getRequests();
      if (data && data.length > 0) {
        setRequests(data);
      } else {
        setRequests(isAuthenticated ? [] : DUMMY_REQUESTS);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequests(isAuthenticated ? [] : DUMMY_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createData.title.trim()) errs.title = 'Title is required';
    if (!createData.description.trim()) errs.description = 'Description is required';
    if (createData.description.length < 20) errs.description = 'Please provide more details (min 20 chars)';
    if (!createData.category) errs.category = 'Category is required';
    
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
    if (createErrors[name]) {
      setCreateErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }
    
    if (!validateCreate()) return;

    setCreating(true);
    try {
      await createRequest({
        ...createData,
        tags: createData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowCreateModal(false);
      setCreateData({ title: '', description: '', category: 'Frontend', tags: '', urgency: 'medium' });
      showToast('Request published successfully!', 'success');
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create request';
      showToast(message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleOfferHelp = async (e: React.MouseEvent, requestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setOfferLoadingId(requestId);
    try {
      await offerHelp(requestId);
      showToast('Help offer sent! The requester will be notified.', 'success');
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to offer help';
      showToast(message, 'error');
    } finally {
      setOfferLoadingId(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = !filterCategory || r.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(requests.map(r => r.category)));

  return (
    <div className="container animate-fade-in-up feed-page-container">
      <GuestOverlay show={!isAuthenticated} message="You're viewing community requests as a guest. Sign in to post or offer help!">
        <div className="feed-header">
        <div>
          <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Community Feed</h1>
          <p className="text-muted">Discover peers who need your expertise, or post your own request.</p>
        </div>
        {(!user || user.role !== 'can_help') && (
          <button
            className="btn btn-primary post-request-btn"
            style={{ borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => isAuthenticated ? setShowCreateModal(true) : router.push('/register')}
          >
            <Plus size={18} /> Post a Request
          </button>
        )}
      </div>

      {/* Search and filter bar */}
      <div className="glass-card search-filter-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search requests by title, tags, or category..." 
            style={{ paddingLeft: '3.5rem', border: '1px solid rgba(0,0,0,0.05)', background: '#f8fafc', borderRadius: '100px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary"
          style={{ gap: '0.6rem', borderRadius: '100px', background: showFilters ? 'rgba(5, 150, 105, 0.1)' : 'white', border: '1px solid rgba(0,0,0,0.05)', color: showFilters ? 'var(--primary)' : undefined, padding: '0.85rem 1.5rem' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass-card animate-fade-in-up" style={{ marginBottom: '2.5rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontWeight: '600', fontSize: '0.95rem' }}>Category:</span>
            <button
              onClick={() => setFilterCategory('')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem', borderRadius: '100px', background: !filterCategory ? 'var(--primary)' : 'white', color: !filterCategory ? 'white' : undefined, borderColor: !filterCategory ? 'var(--primary)' : undefined }}
            >All</button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem', borderRadius: '100px', background: filterCategory === cat ? 'var(--primary)' : 'white', color: filterCategory === cat ? 'white' : undefined, borderColor: filterCategory === cat ? 'var(--primary)' : undefined }}
              >{cat}</button>
            ))}
          </div>
        </div>
      )}

      {/* Request cards */}
      <div className="grid delay-100" style={{ gridTemplateColumns: '1fr' }}>
        {loading ? (
          <>
            <div className="glass-card skeleton" style={{ height: '200px', marginBottom: '1.5rem' }}></div>
            <div className="glass-card skeleton" style={{ height: '200px', marginBottom: '1.5rem' }}></div>
            <div className="glass-card skeleton" style={{ height: '200px', marginBottom: '1.5rem' }}></div>
          </>
        ) : (
          <>
            {filteredRequests.map((request, index) => (
              <Link key={request._id} href={`/requests/${request._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-card animate-fade-in-up feed-request-card" style={{ animationDelay: `${index * 100}ms`, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', marginBottom: '1.5rem', background: 'white' }}>
                  <div className="request-card-header">
                    <h3 className="request-title">{request.title}</h3>
                    <span className="badge urgency-badge" style={{ 
                      background: request.urgency === 'critical' ? 'rgba(239, 68, 68, 0.08)' : request.urgency === 'high' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                      color: request.urgency === 'critical' ? 'var(--danger)' : request.urgency === 'high' ? 'var(--warning)' : 'var(--primary)',
                      border: `1px solid ${request.urgency === 'critical' ? 'rgba(239, 68, 68, 0.15)' : request.urgency === 'high' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(5, 150, 105, 0.15)'}`
                    }}>
                      {request.urgency} Urgency
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {request.tags.map(tag => (
                      <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--primary)', background: 'rgba(5, 150, 105, 0.08)', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: '600' }}>
                        <Tag size={14} /> {tag}
                      </span>
                    ))}
                  </div>

                  <div className="request-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748b', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{request.requester?.name || 'Anonymous'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {timeAgo(request.createdAt)}</span>
                    </div>
                    {(!user || user.role !== 'need_help') && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', gap: '0.6rem', color: 'var(--primary)', borderColor: 'rgba(5, 150, 105, 0.2)', background: 'white', fontWeight: '700' }}
                        onClick={(e) => handleOfferHelp(e, request._id)}
                        disabled={offerLoadingId === request._id}
                      >
                        <HeartHandshake size={18} /> {offerLoadingId === request._id ? 'Sending...' : 'Offer Help'}
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {filteredRequests.length === 0 && (
              <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}><Search size={64} /></div>
                <p style={{ fontSize: '1.2rem' }}>No requests found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div className="glass-card animate-fade-in-up feed-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 className="heading-lg" style={{ marginBottom: 0, fontSize: '2.25rem' }}>Post a Help Request</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Request Title</label>
                <input 
                  name="title"
                  type="text" 
                  className={`form-input ${createErrors.title ? 'border-danger' : ''}`} 
                  placeholder="e.g. Need help debugging React state issue" 
                  value={createData.title} 
                  onChange={handleCreateChange}
                  style={{ background: '#f8fafc' }}
                />
                {createErrors.title && <span className="form-error"><AlertCircle size={14} /> {createErrors.title}</span>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Detailed Description</label>
                <textarea 
                  name="description"
                  className={`form-input ${createErrors.description ? 'border-danger' : ''}`} 
                  placeholder="Describe your problem in detail so others can help..." 
                  value={createData.description} 
                  onChange={handleCreateChange}
                  style={{ minHeight: '150px', resize: 'vertical', background: '#f8fafc' }} 
                />
                {createErrors.description && <span className="form-error"><AlertCircle size={14} /> {createErrors.description}</span>}
              </div>
              <div className="modal-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Category</label>
                  <select 
                    name="category"
                    className="form-input form-select" 
                    value={createData.category} 
                    onChange={handleCreateChange}
                    style={{ background: '#f8fafc' }}
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
                    name="urgency"
                    className="form-input form-select" 
                    value={createData.urgency} 
                    onChange={handleCreateChange}
                    style={{ background: '#f8fafc' }}
                  >
                    <option value="low">Low - Take your time</option>
                    <option value="medium">Medium - Within a few days</option>
                    <option value="high">High - Needed soon</option>
                    <option value="critical">Critical - Blocking progress</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.85rem', color: '#334155', fontWeight: '600' }}>Tags (comma separated)</label>
                <input 
                  name="tags"
                  type="text" 
                  className="form-input" 
                  placeholder="React, CSS, bug..." 
                  value={createData.tags} 
                  onChange={handleCreateChange} 
                  style={{ background: '#f8fafc' }}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ padding: '1.4rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={creating}>
                {creating ? 'Publishing Request...' : 'Publish Help Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .feed-page-container { padding: 2rem 1rem; }
        .feed-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; flex-direction: column; gap: 1.5rem; }
        .post-request-btn { width: 100%; justify-content: center; padding: 1rem; }
        
        .search-filter-bar { margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        
        .feed-request-card { padding: 1.5rem; }
        .request-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-direction: column; gap: 1rem; }
        .request-title { font-size: 1.25rem; font-weight: 700; font-family: var(--font-heading); color: #0f172a; margin: 0; }
        .urgency-badge { width: fit-content; }
        
        .request-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1.25rem; flex-direction: column; gap: 1.25rem; align-items: flex-start; }
        .request-card-footer button { width: 100%; }

        .feed-modal-content { width: 100%; maxWidth: 700px; padding: 1.5rem; background: white; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
        .modal-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }

        @media (min-width: 640px) {
          .feed-page-container { padding: 3rem 2rem; }
          .feed-header { flex-direction: row; align-items: center; margin-bottom: 3rem; gap: 0; }
          .post-request-btn { width: auto; padding: 0.85rem 1.5rem; }
          
          .search-filter-bar { flex-direction: row; gap: 1.5rem; padding: 1.25rem; margin-bottom: 2.5rem; border-radius: 100px; }
          .search-filter-bar input { border-radius: 100px; }
          
          .feed-request-card { padding: 2.5rem; }
          .request-card-header { flex-direction: row; gap: 0; }
          .request-title { font-size: 1.5rem; }
          
          .request-card-footer { flex-direction: row; align-items: center; gap: 0; }
          .request-card-footer button { width: auto; }

          .feed-modal-content { padding: 3.5rem; }
          .modal-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }

        @media (max-width: 480px) {
           .feed-header h1 { font-size: 1.75rem !important; }
           .feed-header p { font-size: 0.9rem; }
        }

        .feed-request-card:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 20px 40px rgba(5, 150, 105, 0.08) !important; }
        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 20px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .border-danger { border-color: var(--danger) !important; }
      `}} />
      </GuestOverlay>
    </div>
  );
}
