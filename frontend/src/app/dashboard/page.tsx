'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, HeartHandshake, TrendingUp, Plus, CheckCircle2 } from 'lucide-react';
import { getMyRequests, getTrends } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GuestOverlay from '@/components/GuestOverlay';

interface MyRequest {
  _id: string;
  title: string;
  status: string;
  urgency: string;
  createdAt: string;
  helpers: { _id: string; name: string }[];
}

interface TrendData {
  name: string;
  requests: number;
  helpGiven: number;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [helpingRequests, setHelpingRequests] = useState<MyRequest[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [stats, setStats] = useState({ total: 0, helping: 0, solved: 0 });

  const DUMMY_TRENDS: TrendData[] = [
    { name: 'Mon', requests: 4, helpGiven: 2 },
    { name: 'Tue', requests: 7, helpGiven: 5 },
    { name: 'Wed', requests: 5, helpGiven: 8 },
    { name: 'Thu', requests: 12, helpGiven: 6 },
    { name: 'Fri', requests: 9, helpGiven: 11 },
    { name: 'Sat', requests: 15, helpGiven: 14 },
    { name: 'Sun', requests: 11, helpGiven: 12 },
  ];

  const DUMMY_STATS = { total: 12, helping: 8, solved: 9 };

  useEffect(() => {
    if (isAuthenticated) {
      loadMyData();
    } else {
      // Load dummy data for guests
      setTrends(DUMMY_TRENDS);
      setStats(DUMMY_STATS);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const [data, trendData] = await Promise.all([
        getMyRequests(),
        getTrends()
      ]);
      
      setMyRequests(data.requested || []);
      setHelpingRequests(data.helping || []);
      setTrends(trendData || []);
      
      const solvedCount = (data.requested || []).filter((r: MyRequest) => r.status === 'solved').length;
      setStats({
        total: (data.requested || []).length,
        helping: (data.helping || []).length,
        solved: solvedCount,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setTrends([]);
      setStats({ total: 0, helping: 0, solved: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container dashboard-container" style={{ padding: '2rem 1rem' }}>
        <div className="dashboard-header">
          <div className="skeleton" style={{ width: '300px', height: '40px' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '40px' }}></div>
        </div>
        <div className="stats-grid">
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
        </div>
        <div className="glass-card skeleton" style={{ height: '400px' }}></div>
        <style dangerouslySetInnerHTML={{ __html: `
          .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; flex-direction: column; gap: 1.5rem; }
          .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem; }
          @media (min-width: 768px) { .dashboard-header { flex-direction: row; align-items: center; } .stats-grid { grid-template-columns: repeat(3, 1fr); } }
          .skeleton {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: 12px;
          }
          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}} />
      </div>
    );
  }

  const showMyRequests = isAuthenticated && user?.role !== 'can_help';
  const showHelpingOthers = isAuthenticated && user?.role !== 'need_help';

  return (
    <div className="container animate-fade-in-up dashboard-container">
      <GuestOverlay show={!isAuthenticated}>
        <div className="dashboard-header">
        <div>
          <h1 className="heading-lg welcome-title" style={{ marginBottom: '0.5rem' }}>
            {isAuthenticated ? `Welcome, ${user?.name}` : 'Platform Insights'}
          </h1>
          <p className="text-muted dashboard-subtitle">
            {isAuthenticated ? 'Your personal dashboard and activity overview.' : 'Monitor community activity and impact metrics.'}
          </p>
        </div>
        {showMyRequests && (
          <Link href="/feed">
            <button className="btn btn-primary action-btn" style={{ display: 'flex', gap: '0.6rem', borderRadius: '100px' }}>
              <Plus size={18} /> New Request
            </button>
          </Link>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {showMyRequests && (
          <div className="glass-card delay-100 stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white' }}>
            <div className="stat-icon-wrapper" style={{ padding: '1.25rem', borderRadius: '20px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary)', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.08)' }}>
              <Activity size={32} />
            </div>
            <div>
              <p className="text-muted" style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>
                My Requests
              </p>
              <h2 className="stat-value" style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                {stats.total}
              </h2>
              <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.25rem' }}>
                {stats.solved} solved
              </p>
            </div>
          </div>
        )}

        {showHelpingOthers && (
          <div className="glass-card delay-200 stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white' }}>
            <div className="stat-icon-wrapper" style={{ padding: '1.25rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.08)' }}>
              <HeartHandshake size={32} />
            </div>
            <div>
              <p className="text-muted" style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>
                Helping Others
              </p>
              <h2 className="stat-value" style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                {stats.helping}
              </h2>
              <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.25rem' }}>
                active contributions
              </p>
            </div>
          </div>
        )}

        <div className="glass-card delay-300 stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white' }}>
          <div className="stat-icon-wrapper" style={{ padding: '1.25rem', borderRadius: '20px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--secondary)', boxShadow: '0 8px 16px rgba(217, 119, 6, 0.08)' }}>
            <Clock size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>
              {isAuthenticated ? 'Trust Score' : 'Avg Response'}
            </p>
            <h2 className="stat-value" style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
              {isAuthenticated ? (user?.trustScore || 0) : '4.2h'}
            </h2>
            <p style={{ color: isAuthenticated ? 'var(--primary)' : 'var(--danger)', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.25rem' }}>
              {isAuthenticated ? 'reputation points' : '-5% vs last week'}
            </p>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="lists-grid">
        {showMyRequests && (
          <div className="glass-card list-card" style={{ background: 'white' }}>
            <h3 className="list-title" style={{ fontWeight: '700', fontFamily: 'var(--font-heading)', marginBottom: '2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Activity size={20} style={{ color: 'var(--primary)' }} /> My Requests
            </h3>
            {myRequests.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 0', background: '#f8fafc', borderRadius: '16px' }}>
                <p>No requests posted yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {(!isAuthenticated ? [
                  { _id: '1', title: 'Connect MongoDB to Next.js', status: 'solved', helpers: [1,2] },
                  { _id: '2', title: 'Center a div with Tailwind', status: 'open', helpers: [1] },
                  { _id: '3', title: 'React context re-rendering issue', status: 'in-progress', helpers: [3,4] }
                ] : myRequests.slice(0, 5)).map((req: any) => (
                  <Link key={req._id} href={isAuthenticated ? `/requests/${req._id}` : '/register'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid transparent' }} className="list-item-hover">
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem', color: '#1e293b' }}>{req.title}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{req.helpers?.length || 0} helpers</p>
                      </div>
                      <span className={`badge badge-${req.status === 'solved' ? 'resolved' : req.status}`} style={{ fontSize: '0.75rem' }}>
                        {req.status === 'solved' ? <><CheckCircle2 size={14} /> Solved</> : req.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        
        {showHelpingOthers && (
          <div className="glass-card list-card" style={{ background: 'white' }}>
            <h3 className="list-title" style={{ fontWeight: '700', fontFamily: 'var(--font-heading)', marginBottom: '2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <HeartHandshake size={20} style={{ color: 'var(--success)' }} /> Helping Others
            </h3>
            {helpingRequests.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 0', background: '#f8fafc', borderRadius: '16px' }}>
                <p>Not helping anyone yet.</p>
                <Link href="/feed" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>Explore requests</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {(!isAuthenticated ? [
                  { _id: '4', title: 'Optimize SQL Queries' },
                  { _id: '5', title: 'Dockerize a Node.js App' }
                ] : helpingRequests.slice(0, 5)).map((req: any) => (
                  <Link key={req._id} href={isAuthenticated ? `/requests/${req._id}` : '/register'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid transparent' }} className="list-item-hover">
                      <p style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{req.title}</p>
                      <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', background: 'rgba(5, 150, 105, 0.08)', padding: '0.4rem 1rem', borderRadius: '100px' }}>Active</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="glass-card delay-300 chart-card" style={{ background: 'white' }}>
        <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h3 className="chart-title" style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>Engagement Trends</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>Community growth and contribution metrics over time.</p>
          </div>
          <div className="chart-legend" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)', flexShrink: 0 }}></span> Requests
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></span> Help Given
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: '400px' }}>
          {trends.length === 0 ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
              <p>No activity trends to display yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHelpGiven" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} dy={15} style={{ fontSize: '0.85rem', fontWeight: '500' }} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} dx={-10} style={{ fontSize: '0.85rem', fontWeight: '500' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '1rem' }}
                  itemStyle={{ fontWeight: '700', fontSize: '0.9rem' }}
                />
                <Area type="monotone" dataKey="requests" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRequests)" activeDot={{ r: 8, strokeWidth: 2, stroke: 'white', fill: 'var(--primary)' }} />
                <Area type="monotone" dataKey="helpGiven" stroke="var(--success)" strokeWidth={4} fillOpacity={1} fill="url(#colorHelpGiven)" activeDot={{ r: 8, strokeWidth: 2, stroke: 'white', fill: 'var(--success)' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        </div>
      </GuestOverlay>
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container { padding: 2rem 1rem; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; flex-direction: column; gap: 1.5rem; }
        .welcome-title { font-size: 2rem; }
        .dashboard-subtitle { font-size: 0.95rem; }
        .action-btn { width: 100%; justify-content: center; padding: 1rem; }

        .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { padding: 1.5rem; }
        .stat-value { font-size: 2.25rem; }

        .lists-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3.5rem; }
        .list-card { padding: 1.5rem; }
        .list-title { font-size: 1.25rem; }

        .chart-card { padding: 1.5rem; }
        .chart-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
        .chart-title { font-size: 1.4rem; }
        .chart-legend { width: 100%; justify-content: flex-start; }

        @media (min-width: 640px) {
          .dashboard-container { padding: 3rem 2rem; }
          .dashboard-header { flex-direction: row; align-items: center; margin-bottom: 3rem; gap: 0; }
          .welcome-title { font-size: 2.5rem; }
          .dashboard-subtitle { font-size: 1.05rem; }
          .action-btn { width: auto; padding: 0.85rem 1.5rem; }

          .stats-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
          .stat-card { padding: 2rem; }
          .stat-value { font-size: 2.75rem; }

          .chart-card { padding: 3rem; }
          .chart-header { flex-direction: row; align-items: center; gap: 0; }
          .chart-title { font-size: 1.6rem; }
          .chart-legend { width: auto; }
        }

        @media (min-width: 1024px) {
          .lists-grid { grid-template-columns: ${showMyRequests && showHelpingOthers ? '1fr 1fr' : '1fr'}; gap: 2.5rem; }
          .list-card { padding: 2.5rem; }
          .list-title { font-size: 1.4rem; }
        }

        @media (max-width: 480px) {
          .stat-icon-wrapper { display: none; }
        }

        .list-item-hover:hover { border-color: var(--primary) !important; background: white !important; box-shadow: 0 8px 24px rgba(0,0,0,0.04); transform: translateX(8px); }
      `}} />
    </div>

  );
}
