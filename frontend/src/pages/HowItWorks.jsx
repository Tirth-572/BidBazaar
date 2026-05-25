import { Link } from 'react-router-dom';

const steps = [
  { icon: '📝', title: 'Create an Account', desc: 'Register for free and verify your email with a one-time OTP to get started.' },
  { icon: '🔍', title: 'Browse Auctions', desc: 'Explore listings across categories like Trading Cards, Comics, Figurines, Coins & more.' },
  { icon: '💰', title: 'Place Your Bid', desc: 'Enter a bid higher than the current highest bid. The highest bidder at close wins.' },
  { icon: '👁️', title: 'Watch Items', desc: 'Add items to your watchlist to track auctions you\'re interested in without bidding.' },
  { icon: '🏆', title: 'Win the Auction', desc: 'The auction owner closes the listing and the highest bidder is declared the winner.' },
  { icon: '📦', title: 'List Your Own Items', desc: 'Sell your collectibles by creating a listing with a title, description, image and starting bid.' },
];

const faqs = [
  { q: 'Is registration free?', a: 'Yes, creating an account on BidBazaar is completely free.' },
  { q: 'How do I know if I won?', a: 'When the auction owner closes the listing, the highest bidder is marked as the winner. You can see your won auctions under Dashboard → Won Auctions.' },
  { q: 'Can I remove an item from my watchlist?', a: 'Yes, click the watchlist button again on the listing detail page to remove it.' },
  { q: 'Who can close an auction?', a: 'Only the owner of the listing can close their auction.' },
  { q: 'Can admins manage listings?', a: 'Yes, admins can deactivate or delete any listing from the Admin Control Panel.' },
];

export default function HowItWorks() {
  return (
    <div className="page" style={{ padding: '80px 24px 64px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 16, letterSpacing: 1 }}>
          GUIDE
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>How BidBazaar Works</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
          Everything you need to know to start bidding and winning on BidBazaar.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 64 }}>
        {steps.map((s, i) => (
          <div key={i} className="card" style={{ padding: '24px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-light)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{s.title}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 56 }}>
        {faqs.map((f, i) => (
          <div key={i} className="card" style={{ padding: '18px 22px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Q: {f.q}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>A: {f.a}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 24px' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Ready to start bidding?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Join thousands of collectors on BidBazaar today.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/account/register" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', textDecoration: 'none', padding: '11px 28px', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Create Free Account</Link>
          <Link to="/auctions/browse-categories" style={{ background: 'transparent', color: 'var(--text)', textDecoration: 'none', padding: '11px 28px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: '1px solid var(--border)' }}>Browse Auctions</Link>
        </div>
      </div>
    </div>
  );
}
