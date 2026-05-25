import { useEffect, useState } from 'react';
import { api } from '../api/client';

function BarChart({ data, labelKey, valueKey, color = '#a855f7' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d) => (
        <div key={d[labelKey]} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 120, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d[labelKey]}</div>
          <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 22, overflow: 'hidden' }}>
            <div style={{ width: `${(d[valueKey] / max) * 100}%`, background: color, height: '100%', borderRadius: 4, minWidth: 4, transition: 'width 0.6s ease', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{d[valueKey]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => { api.adminReports().then(setData).catch(console.error); }, []);

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
    </div>
  );

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Platform analytics & statistics</p>
      </div>

      {/* Highlight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {data.most_bid_item && (
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🔥 Most Bid Item</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{data.most_bid_item.title}</div>
            <div style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>{data.most_bid_item.num_bids} bids</div>
          </div>
        )}
        {data.least_bid_item && (
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📉 Least Bid Item</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{data.least_bid_item.title}</div>
            <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{data.least_bid_item.num_bids} bids</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Category distribution */}
        <Section title="📦 Listings by Category">
          <BarChart data={data.category_data} labelKey="category" valueKey="total_listings" color="#7c3aed" />
        </Section>

        {/* Top bidders */}
        <Section title="🏆 Top Bidders">
          <BarChart data={data.top_bidders.filter(b => b.num_bids > 0)} labelKey="username" valueKey="num_bids" color="#f59e0b" />
        </Section>

        {/* User listings */}
        <Section title="👤 Listings per User">
          <BarChart data={data.user_wise_listings.filter(u => u.total_listings > 0)} labelKey="username" valueKey="total_listings" color="#3b82f6" />
        </Section>

        {/* Daily listings */}
        <Section title="📅 Listings (Last 7 Days)">
          {data.day_wise_listings.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No listings in the last 7 days</p>
            : <BarChart data={data.day_wise_listings} labelKey="created_at__date" valueKey="count" color="#10b981" />
          }
        </Section>

        {/* Monthly registrations */}
        <Section title="📈 User Registrations (Last 7 Days)">
          {data.user_registration_data.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No registrations in the last 7 days</p>
            : <BarChart data={data.user_registration_data} labelKey="date_joined__date" valueKey="total_registrations" color="#a855f7" />
          }
        </Section>

        {/* Monthly listings */}
        <Section title="🗓️ Listings by Month (3 Months)">
          {data.month_wise_listings.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data</p>
            : <BarChart
                data={data.month_wise_listings.map((m, i) => ({ ...m, label: data.month_names[i] || `Month ${m.created_at__month}` }))}
                labelKey="label" valueKey="count" color="#ec4899"
              />
          }
        </Section>

      </div>
    </div>
  );
}
