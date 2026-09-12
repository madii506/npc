// NPC — live $SPY quote + 15 years of weekly closes (reference for the Robinhood Chain stock token).
// Yahoo Finance chart endpoint first, Stooq CSV as fallback. Cached 5 min at the edge. No keys.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (npc; +https://npc.vercel.app)' } };
  try {
    const [r1, r2] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=15y&interval=1wk', UA),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=5d&interval=1d', UA)
    ]);
    if (!r1.ok) throw new Error('yahoo ' + r1.status);
    const j = await r1.json(); const m = j.chart.result[0]; const ts = m.timestamp || []; const closes = (m.indicators.quote[0] || {}).close || [];
    const adj = ((m.indicators.adjclose || [])[0] || {}).adjclose || closes;
    const series = ts.map((t, k) => ({ t: t * 1000, c: closes[k], a: adj[k] })).filter(x => x.c != null && x.a != null);
    let meta = m.meta || {};
    if (r2.ok) { try { const j2 = await r2.json(); meta = Object.assign({}, meta, j2.chart.result[0].meta || {}); } catch (e) {} }
    const last = series[series.length - 1];
    return res.status(200).json({ symbol: 'SPY', price: meta.regularMarketPrice ?? last.c, prevClose: meta.chartPreviousClose ?? meta.previousClose ?? null, time: (meta.regularMarketTime || last.t / 1000) * 1000, marketState: meta.marketState || null, currency: meta.currency || 'USD', source: 'yahoo', series });
  } catch (e1) {
    try {
      const r = await fetch('https://stooq.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv');
      if (!r.ok) throw new Error('stooq ' + r.status);
      const t = await r.text(); const rows = t.trim().split('\n'); const c = rows[1].split(',');
      return res.status(200).json({ symbol: 'SPY', price: +c[6], prevClose: null, time: Date.parse(c[1] + 'T' + c[2] + 'Z') || Date.now(), marketState: null, currency: 'USD', source: 'stooq', series: [] });
    } catch (e2) {
      return res.status(502).json({ error: 'quote unavailable', detail: String(e1.message) + ' / ' + String(e2.message) });
    }
  }
};
