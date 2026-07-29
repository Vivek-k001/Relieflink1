import React, { useEffect, useState, useRef } from 'react';
import { Globe, MapPin, RefreshCw, ExternalLink, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';

const SAURAV_BASE = 'https://saurav.tech/NewsAPI';

const DISASTER_KEYWORDS = [
  'flood','cyclone','earthquake','tsunami','landslide','rescue','relief','disaster',
  'ndrf','imd','emergency','evacuation','storm','heatwave','fire','rain','alert',
  'warning','drought','hurricane','tornado','avalanche','volcanic','casualties'
];

function isDisaster(text = '') {
  const t = text.toLowerCase();
  return DISASTER_KEYWORDS.some(k => t.includes(k));
}

function categorize(title = '', desc = '') {
  const t = (title + ' ' + desc).toLowerCase();
  if (t.includes('flood') || t.includes('rain') || t.includes('waterlog')) return { cat: 'Flood', icon: '🌊', color: '#0284C7' };
  if (t.includes('cyclone') || t.includes('storm') || t.includes('hurricane')) return { cat: 'Cyclone', icon: '🌀', color: '#7C3AED' };
  if (t.includes('earthquake') || t.includes('tremor') || t.includes('seismic')) return { cat: 'Earthquake', icon: 'B45309' };
  if (t.includes('rescue') || t.includes('ndrf') || t.includes('evacuat')) return { cat: 'Rescue', icon: '🚁', color: '#F97316' };
  if (t.includes('relief') || t.includes('camp') || t.includes('aid')) return { cat: 'Relief', icon: '🏕️', color: '#059669' };
  if (t.includes('heat') || t.includes('temperature')) return { cat: 'Heatwave', icon: '☀️', color: '#D97706' };
  if (t.includes('fire') || t.includes('blaze')) return { cat: 'Fire', icon: '🔥', color: '#DC2626' };
  if (t.includes('landslide') || t.includes('avalanche')) return { cat: 'Landslide', icon: '⛰️', color: '#92400E' };
  if (t.includes('alert') || t.includes('warning')) return { cat: 'Alert', icon: '🚨', color: '#EF4444' };
  return { cat: 'General', icon: '📰', color: '#64748B' };
}

const FALLBACK_LOCAL = [
  { title: 'IMD issues Red Alert for heavy rainfall in Kerala and Karnataka coast', source: 'IMD India', publishedAt: new Date().toISOString(), ...categorize('IMD Red Alert rainfall Kerala'), url: '#' },
  { title: 'NDRF teams deployed across flood-hit districts in Assam', source: 'NDRF', publishedAt: new Date().toISOString(), ...categorize('NDRF deployed rescue Assam'), url: '#' },
  { title: 'Cyclone warning issued for Bay of Bengal; coastal evacuation underway', source: 'Ministry of Earth Sciences', publishedAt: new Date().toISOString(), ...categorize('cyclone warning evacuation coast'), url: '#' },
  { title: 'Maharashtra government opens 120 new relief camps for flood victims', source: 'Maharashtra Govt', publishedAt: new Date().toISOString(), ...categorize('relief camp flood Maharashtra'), url: '#' },
  { title: 'Heatwave warning extended across Rajasthan and Uttar Pradesh', source: 'IMD India', publishedAt: new Date().toISOString(), ...categorize('heatwave warning temperature'), url: '#' },
  { title: 'Landslide in Uttarakhand: 3 villages cut off; rescue operation live', source: 'SDRF Uttarakhand', publishedAt: new Date().toISOString(), ...categorize('landslide rescue Uttarakhand'), url: '#' },
  { title: 'Kerala Emergency Operation Center issues flood watch for Idukki and Wayanad', source: 'SEOC Kerala', publishedAt: new Date().toISOString(), ...categorize('flood alert Kerala'), url: '#' },
  { title: 'Odisha Disaster Response Force prepares coastal shelters ahead of storm', source: 'ODRAF Odisha', publishedAt: new Date().toISOString(), ...categorize('cyclone storm shelter Odisha'), url: '#' },
  { title: 'Indian Army deploys amphibious vehicles for rescue operations in flood zone', source: 'Indian Army', publishedAt: new Date().toISOString(), ...categorize('rescue operation flood Army'), url: '#' },
];

const FALLBACK_INTL = [
  { title: 'Massive flooding affects millions across Southeast Asia', source: 'BBC News', publishedAt: new Date().toISOString(), ...categorize('flooding Southeast Asia disaster'), url: '#' },
  { title: 'UN warns of record hurricane season; emergency response teams deployed', source: 'CNN', publishedAt: new Date().toISOString(), ...categorize('hurricane warning emergency'), url: '#' },
  { title: 'Earthquake strikes Turkey; rescue teams search for survivors', source: 'BBC News', publishedAt: new Date().toISOString(), ...categorize('earthquake rescue survivors'), url: '#' },
  { title: 'Pacific Island nations under tsunami alert following undersea quake', source: 'Google News', publishedAt: new Date().toISOString(), ...categorize('tsunami alert earthquake Pacific'), url: '#' },
  { title: 'Wildfire season breaks records across Mediterranean; 10,000 evacuated', source: 'CNN', publishedAt: new Date().toISOString(), ...categorize('wildfire fire evacuation Mediterranean'), url: '#' },
  { title: 'Global Disaster Relief Fund allocated $50M for emergency flood response', source: 'UN ReliefWeb', publishedAt: new Date().toISOString(), ...categorize('relief emergency flood response'), url: '#' },
];

const CATS = ['All', 'Flood', 'Cyclone', 'Earthquake', 'Rescue', 'Relief', 'Alert', 'Fire'];

async function fetchDirect(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const d = await r.json();
    return d.articles || [];
  } catch { return []; }
}

export default function DisasterNews({ compact = false }) {
  const [localNews, setLocalNews] = useState(FALLBACK_LOCAL);
  const [intlNews, setIntlNews] = useState(FALLBACK_INTL);
  const [tab, setTab] = useState('local'); // 'local' | 'international'
  const [catFilter, setCatFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [hasLive, setHasLive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadNews();
    return () => { mounted.current = false; };
  }, []);

  // Reset page to 1 whenever tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, catFilter]);

  async function loadNews() {
    setLoading(true);
    try {
      const [generalIN, healthIN, bbcArt, cnnArt, googleArt] = await Promise.all([
        fetchDirect(`${SAURAV_BASE}/top-headlines/category/general/in.json`),
        fetchDirect(`${SAURAV_BASE}/top-headlines/category/health/in.json`),
        fetchDirect(`${SAURAV_BASE}/everything/bbc-news.json`),
        fetchDirect(`${SAURAV_BASE}/everything/cnn.json`),
        fetchDirect(`${SAURAV_BASE}/everything/google-news.json`),
      ]);

      if (!mounted.current) return;

      const allLocal = [...generalIN, ...healthIN];
      const seenL = new Set();
      const mappedLocal = allLocal
        .filter(a => { if (!a.title || seenL.has(a.title)) return false; seenL.add(a.title); return true; })
        .map(a => ({ ...a, ...categorize(a.title, a.description), source: a.source?.name || 'India News' }))
        .sort((a, b) => {
          const aD = isDisaster(a.title + a.description);
          const bD = isDisaster(b.title + b.description);
          if (aD && !bD) return -1; if (!aD && bD) return 1;
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        })
        .slice(0, 24);

      const allIntl = [
        ...bbcArt.map(a => ({ ...a, source: 'BBC News' })),
        ...cnnArt.map(a => ({ ...a, source: 'CNN' })),
        ...googleArt.map(a => ({ ...a, source: 'Google News' })),
      ];
      const seenI = new Set();
      const mappedIntl = allIntl
        .filter(a => { if (!a.title || seenI.has(a.title)) return false; seenI.add(a.title); return true; })
        .map(a => ({ ...a, ...categorize(a.title, a.description) }))
        .sort((a, b) => {
          const aD = isDisaster(a.title + a.description);
          const bD = isDisaster(b.title + b.description);
          if (aD && !bD) return -1; if (!aD && bD) return 1;
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        })
        .slice(0, 24);

      if (mappedLocal.length > 0) setLocalNews(mappedLocal);
      if (mappedIntl.length > 0) setIntlNews(mappedIntl);
      if (mappedLocal.length > 0 || mappedIntl.length > 0) setHasLive(true);
    } catch (e) {
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  // Ticker rotation for compact mode
  useEffect(() => {
    if (!compact) return;
    const all = [...localNews, ...intlNews].filter(n => isDisaster(n.title + (n.description || '')));
    if (all.length === 0) return;
    const t = setInterval(() => setTicker(i => (i + 1) % all.length), 4500);
    return () => clearInterval(t);
  }, [compact, localNews, intlNews]);

  if (compact) {
    const all = [...localNews, ...intlNews].filter(n => isDisaster(n.title + (n.description || '')));
    const n = all[ticker] || all[0] || localNews[0];
    if (!n) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', color: 'white' }}>
        <span style={{ background: 'rgba(239,68,68,0.9)', color: 'white', padding: '2px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
          📡 LIVE
        </span>
        <span style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: 'rgba(255,255,255,0.92)' }}>
          {n.icon} {n.title}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.source}</span>
      </div>
    );
  }

  const activeNews = tab === 'local' ? localNews : intlNews;
  const filtered = catFilter === 'All' ? activeNews : activeNews.filter(n => n.cat === catFilter);

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageNews = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(20,30,55,0.97) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.09)', color: 'white',
      fontFamily: 'Inter,sans-serif', height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: '0 24px 64px rgba(0,0,0,0.35)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse-sos 1.5s infinite' }} />
            <span style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'Outfit,sans-serif' }}>News Corner</span>
            {hasLive && <span style={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80', fontSize: '0.65rem', padding: '1px 7px', borderRadius: 8, fontWeight: 700, border: '1px solid rgba(34,197,94,0.35)' }}>LIVE</span>}
          </div>
          <button onClick={loadNews} disabled={loading} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.3rem 0.6rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Local / International tab */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
          {[
            { key: 'local', label: '🇮🇳 Local', Icon: MapPin },
            { key: 'international', label: '🌍 International', Icon: Globe },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setCatFilter('All'); }}
              style={{ flex: 1, padding: '0.4rem 0.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s',
                background: tab === t.key ? 'rgba(96,165,250,0.25)' : 'transparent',
                color: tab === t.key ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                outline: tab === t.key ? '1px solid rgba(96,165,250,0.3)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: '0.175rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              border: catFilter === c ? '1.5px solid #60A5FA' : '1.5px solid rgba(255,255,255,0.1)',
              background: catFilter === c ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
              color: catFilter === c ? '#93C5FD' : 'rgba(255,255,255,0.45)',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* 6 Items per Page News List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {loading && filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'float 2s ease-in-out infinite' }}>📡</div>
            Fetching latest news...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            <Newspaper size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <div>No news in this category</div>
          </div>
        ) : pageNews.map((item, i) => (
          <div key={i}
            style={{ padding: '0.7rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: item.url && item.url !== '#' ? 'pointer' : 'default' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
            onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>{item.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.88)', margin: '0 0 0.25rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ background: `${item.color}25`, color: item.color, padding: '1px 7px', borderRadius: 8, fontSize: '0.64rem', fontWeight: 700, border: `1px solid ${item.color}40` }}>
                    {item.cat}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{item.source}</span>
                  {item.publishedAt && (
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>
                      · {new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {item.url && item.url !== '#' && (
                    <ExternalLink size={10} style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 2 }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.3rem 0.6rem', borderRadius: 8,
              background: currentPage === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: currentPage === 1 ? 'rgba(255,255,255,0.25)' : 'white',
              fontSize: '0.75rem', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}>
            <ChevronLeft size={14} /> Prev
          </button>

          {/* Page numbers */}
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: pageNum === currentPage ? '1.5px solid #60A5FA' : '1px solid rgba(255,255,255,0.1)',
                  background: pageNum === currentPage ? 'rgba(96,165,250,0.25)' : 'transparent',
                  color: pageNum === currentPage ? '#93C5FD' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem', fontWeight: pageNum === currentPage ? 800 : 500,
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.3rem 0.6rem', borderRadius: 8,
              background: currentPage === totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: currentPage === totalPages ? 'rgba(255,255,255,0.25)' : 'white',
              fontSize: '0.75rem', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Footer credits */}
      <div style={{ padding: '0.4rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', margin: 0, textAlign: 'center' }}>
          Page {currentPage} of {totalPages} · Sources: BBC News · CNN · NDTV · IMD · Google News
        </p>
      </div>
    </div>
  );
}
