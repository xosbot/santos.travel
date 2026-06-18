function buildDevelopmentPlanHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  :root {
    --gold: #C9A84C; --gold-light: #E8CC7A; --gold-dark: #A0822C;
    --deep-teal: #0A2E2B; --teal: #0D4A42; --teal-mid: #1A6B5E; --teal-light: #2A8B7A;
    --ink: #1C1C2E; --ink-soft: #3D3D52; --muted: #7A7A9D;
    --white: #FFFFFF; --off-white: #FAFAF8; --bg-soft: #F4F4F0; --border: #E2E2E8;
    --success: #2E8B57; --warning: #D4A017; --danger: #C0392B;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: var(--off-white);
    color: var(--ink);
    font-size: 9.5pt;
    line-height: 1.55;
  }
  @page { size: A4; margin: 0; }

  .page {
    width: 210mm; min-height: 297mm;
    margin: 0 auto; background: var(--white);
    position: relative; overflow: hidden;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* Typography */
  h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 28pt; color: var(--deep-teal); line-height: 1.2; }
  h2 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 18pt; color: var(--deep-teal); margin-bottom: 16px; }
  h3 { font-size: 12pt; color: var(--teal); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
  h4 { font-size: 10.5pt; color: var(--ink); margin-bottom: 6px; }
  p { margin-bottom: 12px; color: var(--ink-soft); }
  .subtitle { font-size: 11pt; color: var(--muted); margin-top: 8px; }
  .label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); }

  /* Header */
  .header {
    background: var(--deep-teal);
    padding: 28px 36px 24px;
    color: var(--white);
  }
  .header-row {
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .brand {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-size: 20px; font-weight: 700;
  }
  .brand span { color: var(--gold-light); }
  .brand-sub {
    font-size: 7.5px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--gold-light); margin-top: 2px;
  }
  .badge {
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: 6px; padding: 5px 12px;
    font-size: 7.5px; font-weight: 600;
    color: var(--gold-light); letter-spacing: 1.5px; text-transform: uppercase;
  }
  .gold-bar { height: 4px; background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold)); }

  /* Content */
  .content { padding: 28px 36px 60px; }

  /* Cover */
  .cover {
    background: var(--deep-teal);
    color: var(--white);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; padding: 60px;
  }
  .cover-logo { font-family: 'Playfair Display', 'Georgia', serif; font-size: 42px; font-weight: 700; margin-bottom: 12px; }
  .cover-logo span { color: var(--gold-light); }
  .cover-tagline { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold-light); margin-bottom: 60px; }
  .cover-title { font-family: 'Playfair Display', 'Georgia', serif; font-size: 36px; font-weight: 700; margin-bottom: 20px; line-height: 1.25; }
  .cover-subtitle { font-size: 14pt; color: rgba(255,255,255,0.75); max-width: 420px; margin-bottom: 80px; }
  .cover-meta { display: flex; gap: 48px; font-size: 9pt; color: rgba(255,255,255,0.6); }
  .cover-meta-item strong { display: block; color: var(--gold-light); font-size: 11pt; margin-bottom: 4px; }
  .cover-decoration {
    position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
    background: linear-gradient(180deg, transparent, rgba(201,168,76,0.08));
  }

  /* Cards */
  .card {
    background: var(--white); border: 1px solid var(--border); border-radius: 8px;
    padding: 18px; margin-bottom: 14px;
  }
  .card-highlight {
    background: linear-gradient(135deg, var(--deep-teal), var(--teal));
    color: var(--white); border: none;
  }
  .card-highlight p { color: rgba(255,255,255,0.85); }
  .card-grid { display: flex; gap: 14px; flex-wrap: wrap; }
  .card-grid .card { flex: 1; min-width: 140px; }

  /* Metric cards */
  .metric { text-align: center; }
  .metric-value {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-size: 24pt; font-weight: 700; color: var(--deep-teal);
  }
  .metric-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-top: 4px; }
  .card-highlight .metric-value { color: var(--gold-light); }
  .card-highlight .metric-label { color: rgba(255,255,255,0.65); }

  /* Charts */
  .bar-chart { margin: 16px 0; }
  .bar-row { display: flex; align-items: center; margin-bottom: 10px; }
  .bar-label { width: 90px; font-size: 8.5pt; color: var(--ink-soft); }
  .bar-track { flex: 1; height: 22px; background: var(--bg-soft); border-radius: 4px; overflow: hidden; margin: 0 10px; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--teal-light)); border-radius: 4px; }
  .bar-fill-gold { background: linear-gradient(90deg, var(--gold-dark), var(--gold)); }
  .bar-value { width: 80px; font-size: 9pt; font-weight: 600; color: var(--deep-teal); text-align: right; }

  /* Pie chart */
  .pie-chart {
    width: 140px; height: 140px; border-radius: 50%;
    background: conic-gradient(
      var(--deep-teal) 0deg 130deg,
      var(--teal-mid) 130deg 220deg,
      var(--gold) 220deg 300deg,
      var(--teal-light) 300deg 360deg
    );
    position: relative; margin: 0 auto;
  }
  .pie-center {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 90px; height: 90px; background: var(--white); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', 'Georgia', serif; font-size: 14pt; color: var(--deep-teal); font-weight: 700;
  }

  /* Quadrant */
  .quadrant {
    width: 100%; height: 280px; position: relative;
    border-left: 2px solid var(--ink-soft); border-bottom: 2px solid var(--ink-soft);
    margin: 20px 0;
  }
  .quadrant-label {
    position: absolute; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--muted);
  }
  .ql-top { top: -18px; left: 50%; transform: translateX(-50%); }
  .ql-bottom { bottom: -18px; left: 50%; transform: translateX(-50%); }
  .ql-left { left: -60px; top: 50%; transform: translateY(-50%) rotate(-90deg); transform-origin: center; }
  .ql-right { right: -70px; top: 50%; transform: translateY(-50%) rotate(90deg); transform-origin: center; }
  .quad-dot {
    position: absolute; width: 10px; height: 10px; border-radius: 50%;
    background: var(--teal); border: 2px solid var(--white); box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .quad-dot.gold { background: var(--gold); width: 14px; height: 14px; }
  .quad-dot-label {
    position: absolute; font-size: 7pt; color: var(--ink-soft); white-space: nowrap;
  }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 16px; }
  thead tr { background: var(--teal); color: var(--white); }
  thead th { padding: 9px 10px; text-align: left; font-size: 7.5pt; font-weight: 600; letter-spacing: 0.5px; }
  thead th:first-child { border-radius: 6px 0 0 0; }
  thead th:last-child { border-radius: 0 6px 0 0; }
  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 8px 10px; color: var(--ink-soft); }
  tbody tr:nth-child(even) { background: var(--off-white); }

  /* Timeline */
  .timeline { position: relative; padding-left: 24px; margin: 16px 0; }
  .timeline::before {
    content: ''; position: absolute; left: 8px; top: 4px; bottom: 4px;
    width: 2px; background: var(--border);
  }
  .timeline-item { position: relative; margin-bottom: 16px; }
  .timeline-dot {
    position: absolute; left: -20px; top: 2px; width: 12px; height: 12px;
    border-radius: 50%; background: var(--gold); border: 2px solid var(--white); box-shadow: 0 0 0 2px var(--gold);
  }
  .timeline-title { font-weight: 700; color: var(--deep-teal); font-size: 9.5pt; }
  .timeline-meta { font-size: 7.5pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .timeline-content { font-size: 8.5pt; color: var(--ink-soft); }

  /* Progress bars */
  .progress-row { display: flex; align-items: center; margin-bottom: 8px; }
  .progress-label { width: 70px; font-size: 8pt; color: var(--ink-soft); }
  .progress-track { flex: 1; height: 8px; background: var(--bg-soft); border-radius: 4px; overflow: hidden; margin: 0 8px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--gold)); border-radius: 4px; }
  .progress-value { width: 36px; font-size: 8pt; font-weight: 600; color: var(--deep-teal); text-align: right; }

  /* Before/after */
  .before-after { display: flex; gap: 14px; margin: 16px 0; }
  .ba-box { flex: 1; background: var(--bg-soft); border-radius: 8px; padding: 16px; }
  .ba-box h4 { color: var(--deep-teal); }
  .ba-box.bad { border-left: 4px solid var(--danger); }
  .ba-box.good { border-left: 4px solid var(--success); }
  .ba-value { font-family: 'Playfair Display', 'Georgia', serif; font-size: 18pt; font-weight: 700; color: var(--deep-teal); margin: 8px 0; }

  /* Lists */
  ul { margin-left: 18px; margin-bottom: 12px; }
  li { margin-bottom: 5px; color: var(--ink-soft); }

  /* Tags */
  .tag {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 7pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    margin-right: 4px;
  }
  .tag-p0 { background: var(--deep-teal); color: var(--white); }
  .tag-p1 { background: var(--teal-mid); color: var(--white); }
  .tag-p2 { background: var(--bg-soft); color: var(--ink-soft); border: 1px solid var(--border); }

  /* Footer */
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 14px 36px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between;
    font-size: 7pt; color: var(--muted);
  }
  .page-number { font-weight: 600; }

  /* Two columns */
  .two-col { display: flex; gap: 20px; }
  .two-col > div { flex: 1; }

  /* Page break helpers */
  .pb { page-break-before: always; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; }
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div class="cover-logo">santos<span>.travel</span></div>
  <div class="cover-tagline">Kerala · South India · Inbound Tours</div>
  <div class="cover-title">IVA Cortex<br>Phase 2 Development Plan</div>
  <div class="cover-subtitle">A six-month roadmap to transform santos.travel into an AI-assisted, premium boutique tour operations platform.</div>
  <div class="cover-meta">
    <div class="cover-meta-item"><strong>Prepared For</strong>Owner, santos.travel</div>
    <div class="cover-meta-item"><strong>Date</strong>June 2026</div>
    <div class="cover-meta-item"><strong>Status</strong>Strategic Plan</div>
  </div>
  <div class="cover-decoration"></div>
</div>

<!-- PAGE 2: EXECUTIVE SUMMARY -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Executive Summary</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>Where We Are & Where We're Going</h2>
    <p><strong>IVA Cortex Phase 1</strong> is live: a deterministic quoting engine, LLM-powered inquiry extraction, branded PDF itineraries, and an admin UI. The system already protects margins by ensuring AI never calculates prices.</p>

    <div class="card-grid" style="margin: 20px 0;">
      <div class="card metric">
        <div class="metric-value">9.95M</div>
        <div class="metric-label">India FTAs 2024</div>
      </div>
      <div class="card metric">
        <div class="metric-value">$36.8B</div>
        <div class="metric-label">Visitor Spend 2024</div>
      </div>
      <div class="card metric">
        <div class="metric-value">$8–12B</div>
        <div class="metric-label">SAM (Premium South India)</div>
      </div>
      <div class="card metric">
        <div class="metric-value">$10M</div>
        <div class="metric-label">Base-Case Revenue Target</div>
      </div>
    </div>

    <div class="card card-highlight">
      <h3 style="color: var(--gold-light);">Strategic Opportunity</h3>
      <p>The Kerala/South India inbound market is crowded but fragmented. Global luxury brands lack deep Kerala focus. Mass-market Kerala specialists lack premium curation. <strong>santos.travel's whitespace is the "premium boutique" position: deep local expertise plus AI-assisted speed.</strong></p>
    </div>

    <h3>Phase 2 Objective</h3>
    <p>Move from <em>quote-to-PDF</em> automation to a complete <em>inquiry-to-fulfillment</em> platform: intelligent itinerary building, supplier confirmation, payment milestones, B2B partner distribution, and owner analytics.</p>

    <h3>Expected Outcome</h3>
    <ul>
      <li><strong>Quote turnaround:</strong> 6–48 hours → under 30 minutes</li>
      <li><strong>Operational capacity:</strong> 3× more inquiries with the same team</li>
      <li><strong>Quantified annual benefit:</strong> ~₹90 lakh in time savings, error reduction, upsell capture, and conversion improvement</li>
      <li><strong>Revenue target:</strong> ~400 private trips/year to reach $10M base case</li>
    </ul>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">2 / 10</span></div>
</div>

<!-- PAGE 3: MARKET OPPORTUNITY -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Market Opportunity</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>The Market Size</h2>
    <p>India's inbound tourism has rebounded strongly. Kerala and South India attract high-yield, long-haul travelers ideal for santos.travel's premium FIT positioning.</p>

    <h3>TAM / SAM / SOM</h3>
    <div class="bar-chart">
      <div class="bar-row">
        <div class="bar-label">TAM</div>
        <div class="bar-track"><div class="bar-fill" style="width: 100%;"></div></div>
        <div class="bar-value">$36.8–37.5B</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">SAM</div>
        <div class="bar-track"><div class="bar-fill" style="width: 32%;"></div></div>
        <div class="bar-value">$8–12B</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">SOM</div>
        <div class="bar-track"><div class="bar-fill bar-fill-gold" style="width: 4%;"></div></div>
        <div class="bar-value">$5–15M</div>
      </div>
    </div>

    <div class="two-col">
      <div>
        <h3>India Inbound Recovery</h3>
        <table>
          <thead><tr><th>Year</th><th>FTAs (mn)</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>2019</td><td>10.93</td><td>Peak</td></tr>
            <tr><td>2022</td><td>6.44</td><td>Recovery</td></tr>
            <tr><td>2023</td><td>9.51</td><td>+47.6%</td></tr>
            <tr><td>2024</td><td>9.95</td><td>91% of peak</td></tr>
            <tr><td>2028</td><td>30.5</td><td>Forecast</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3>South India FTAs 2024</h3>
        <div class="pie-chart">
          <div class="pie-center">2.89M</div>
        </div>
        <p style="font-size: 8pt; text-align: center; margin-top: 10px;">Tamil Nadu 1.16M · Kerala 0.73M · KA/AP/TS ~1.0M</p>
      </div>
    </div>

    <h3>Target Customer Profile</h3>
    <div class="card-grid">
      <div class="card"><strong>2–8 pax</strong><br><span style="font-size: 8pt; color: var(--muted);">FIT / small private group</span></div>
      <div class="card"><strong>10–14 nights</strong><br><span style="font-size: 8pt; color: var(--muted);">Average trip length</span></div>
      <div class="card"><strong>$300–600</strong><br><span style="font-size: 8pt; color: var(--muted);">Spend per person/day</span></div>
      <div class="card"><strong>US/UK/EU/AU/CAN</strong><br><span style="font-size: 8pt; color: var(--muted);">Primary source markets</span></div>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">3 / 10</span></div>
</div>

<!-- PAGE 4: COMPETITIVE LANDSCAPE -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Competitive Landscape</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>Where santos.travel Wins</h2>
    <p>No competitor combines high digital maturity with deep, boutique-level Kerala/South India service curation.</p>

    <div class="quadrant">
      <div class="quadrant-label ql-top">Premium / Luxury</div>
      <div class="quadrant-label ql-bottom">Mass / Budget</div>
      <div class="quadrant-label ql-left">Local / Specialist</div>
      <div class="quadrant-label ql-right">Global / Scale</div>

      <div class="quad-dot gold" style="left: 28%; top: 28%;"></div>
      <div class="quad-dot-label" style="left: 32%; top: 25%;"><strong>santos.travel</strong> — target</div>

      <div class="quad-dot" style="left: 75%; top: 22%;"></div>
      <div class="quad-dot-label" style="left: 79%; top: 19%;">Enchanting Travels</div>

      <div class="quad-dot" style="left: 85%; top: 15%;"></div>
      <div class="quad-dot-label" style="left: 72%; top: 11%;">Greaves India</div>

      <div class="quad-dot" style="left: 50%; top: 20%;"></div>
      <div class="quad-dot-label" style="left: 53%; top: 17%;">CGH Earth</div>

      <div class="quad-dot" style="left: 35%; top: 55%;"></div>
      <div class="quad-dot-label" style="left: 39%; top: 52%;">Kalypso Adventures</div>

      <div class="quad-dot" style="left: 60%; top: 60%;"></div>
      <div class="quad-dot-label" style="left: 64%; top: 57%;">Iris Holidays</div>

      <div class="quad-dot" style="left: 70%; top: 72%;"></div>
      <div class="quad-dot-label" style="left: 74%; top: 69%;">SOTC</div>
    </div>

    <h3>Competitive Positioning Summary</h3>
    <table>
      <thead><tr><th>Competitor</th><th>Tier</th><th>Digital</th><th>Key Weakness</th></tr></thead>
      <tbody>
        <tr><td>Enchanting Travels</td><td>Luxury</td><td>High</td><td>Kerala is a small slice</td></tr>
        <tr><td>Greaves India</td><td>Ultra-luxury</td><td>Medium</td><td>No online pricing; high minimum</td></tr>
        <tr><td>CGH Earth</td><td>Luxury</td><td>Medium-High</td><td>Hotelier, not itinerary builder</td></tr>
        <tr><td>Iris Holidays</td><td>Mid-Premium</td><td>Medium-High</td><td>Mass-market identity</td></tr>
        <tr><td>Paradise Holidays</td><td>Mid-Premium</td><td>Medium</td><td>Dated UX, mass feel</td></tr>
        <tr><td>SOTC</td><td>Budget-Mid</td><td>High</td><td>Impersonal, not premium</td></tr>
      </tbody>
    </table>

    <div class="card card-highlight">
      <h3 style="color: var(--gold-light);">Winning Position</h3>
      <p><strong>Premium boutique South India specialist with AI-assisted speed.</strong> Price above mass-market operators, below ultra-luxury globals. Target ₹75,000–₹2,50,000 per person for 7–10 day FIT journeys.</p>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">4 / 10</span></div>
</div>

<!-- PAGE 5: STRATEGIC POSITIONING -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Strategic Positioning</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>SWOT Analysis</h2>
    <div class="two-col">
      <div>
        <h3>Strengths</h3>
        <ul>
          <li>Kerala is a globally recognized tourism superbrand</li>
          <li>Premium FIT niche = higher margins</li>
          <li>Diverse portfolio: backwaters, Ayurveda, heritage, wildlife</li>
          <li>Strong source markets: US, UK, EU, AU, GCC</li>
          <li>Deterministic pricing protects margin</li>
        </ul>
      </div>
      <div>
        <h3>Weaknesses</h3>
        <ul>
          <li>Owner/team-dependent operations</li>
          <li>Manual, spreadsheet-driven quoting</li>
          <li>Fragmented data across channels</li>
          <li>Limited digital distribution / no B2B API</li>
          <li>Seasonality creates uneven cash flow</li>
        </ul>
      </div>
    </div>
    <div class="two-col">
      <div>
        <h3>Opportunities</h3>
        <ul>
          <li>Post-pandemic FIT/privacy tailwind</li>
          <li>Wellness/Ayurveda tourism growth</li>
          <li>B2B partner channel via whitelabel API</li>
          <li>SEO content engine for high-intent traffic</li>
          <li>24/7 AI inquiry capture across time zones</li>
        </ul>
      </div>
      <div>
        <h3>Threats</h3>
        <ul>
          <li>OTA and platform price transparency</li>
          <li>AI-enabled competitors with generic chatbots</li>
          <li>Margin pressure from vendor rate inflation</li>
          <li>Economic volatility in source markets</li>
          <li>Operational risk from automation errors</li>
        </ul>
      </div>
    </div>

    <h2 style="margin-top: 24px;">Five Positioning Angles</h2>
    <div class="card-grid">
      <div class="card"><h4>Anti-Template Boutique</h4><p style="font-size: 8.5pt;">"No two travelers are identical, so no two itineraries should be."</p></div>
      <div class="card"><h4>Math-First Luxury</h4><p style="font-size: 8.5pt;">"AI writes the prose; deterministic code protects your price."</p></div>
      <div class="card"><h4>South India Inside Track</h4><p style="font-size: 8.5pt;">"Kerala is our backyard. The rest of South India is our neighborhood."</p></div>
      <div class="card"><h4>Invisible Concierge</h4><p style="font-size: 8.5pt;">"From first WhatsApp to final airport drop, we're one message away."</p></div>
      <div class="card"><h4>Agent's Agent</h4><p style="font-size: 8.5pt;">"South India's most reliable backend for international travel advisors."</p></div>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">5 / 10</span></div>
</div>

<!-- PAGE 6: ROI -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Automation ROI</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>The Business Case for IVA Cortex</h2>
    <p>IVA Cortex does not replace the human touch. It removes repetitive assembly work so the same team can handle more high-value trips.</p>

    <div class="before-after">
      <div class="ba-box bad">
        <h4>Manual Today</h4>
        <div class="ba-value">6–48 hrs</div>
        <p>Lead-to-quote cycle</p>
        <div class="ba-value">4 hrs</div>
        <p>Per quote assembly</p>
        <div class="ba-value">80</div>
        <p>Inquiries/month capacity</p>
      </div>
      <div class="ba-box good">
        <h4>With IVA Cortex</h4>
        <div class="ba-value">&lt;30 min</div>
        <p>Lead-to-quote cycle</p>
        <div class="ba-value">20 min</div>
        <p>Per quote (human review)</p>
        <div class="ba-value">240–300</div>
        <p>Inquiries/month capacity</p>
      </div>
    </div>

    <h3>Annual Quantified Benefit</h3>
    <div class="bar-chart">
      <div class="bar-row">
        <div class="bar-label">Time Savings</div>
        <div class="bar-track"><div class="bar-fill" style="width: 92%;"></div></div>
        <div class="bar-value">₹55.4L</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">Conversion Margin</div>
        <div class="bar-track"><div class="bar-fill" style="width: 36%;"></div></div>
        <div class="bar-value">₹21.6L</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">Upsell Capture</div>
        <div class="bar-track"><div class="bar-fill" style="width: 12%;"></div></div>
        <div class="bar-value">₹7.2L</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">Error Reduction</div>
        <div class="bar-track"><div class="bar-fill" style="width: 10%;"></div></div>
        <div class="bar-value">₹6.1L</div>
      </div>
    </div>

    <div class="card card-highlight" style="text-align: center;">
      <div class="metric-value" style="color: var(--gold-light); font-size: 32pt;">₹90.3 Lakh</div>
      <div class="metric-label" style="color: rgba(255,255,255,0.65);">Total Estimated Annual Benefit</div>
    </div>

    <h3>Key Operational Wins</h3>
    <div class="card-grid">
      <div class="card"><strong>308 hrs</strong><br><span style="font-size: 8pt; color: var(--muted);">Owner/ops hours saved/month</span></div>
      <div class="card"><strong>3×</strong><br><span style="font-size: 8pt; color: var(--muted);">Inquiry capacity expansion</span></div>
      <div class="card"><strong>90%</strong><br><span style="font-size: 8pt; color: var(--muted);">Pricing error reduction</span></div>
      <div class="card"><strong>+3–5 ppt</strong><br><span style="font-size: 8pt; color: var(--muted);">Conversion rate uplift</span></div>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">6 / 10</span></div>
</div>

<!-- PAGE 7: PHASE 2 ROADMAP -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Phase 2 Roadmap</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>Release Streams</h2>

    <h3>Release A — Quick Wins: Client Experience & Conversion</h3>
    <table>
      <thead><tr><th>Feature</th><th>Impact</th><th>Effort</th><th>Priority</th></tr></thead>
      <tbody>
        <tr><td>WhatsApp + Email Threading</td><td>Reduces response lag; improves CX</td><td>Small</td><td><span class="tag tag-p1">P1</span></td></tr>
        <tr><td>Lead Scoring & CRM Workflows</td><td>Higher lead-to-quote conversion</td><td>Small</td><td><span class="tag tag-p1">P1</span></td></tr>
        <tr><td>Post-Trip Review Engine</td><td>Builds social proof</td><td>Small</td><td><span class="tag tag-p2">P2</span></td></tr>
      </tbody>
    </table>

    <h3>Release B — Core Platform: Operations & Revenue</h3>
    <table>
      <thead><tr><th>Feature</th><th>Impact</th><th>Effort</th><th>Priority</th></tr></thead>
      <tbody>
        <tr><td>Intelligent Itinerary Builder</td><td>Cuts itinerary drafting from hours to minutes</td><td>Large</td><td><span class="tag tag-p0">P0</span></td></tr>
        <tr><td>Supplier Availability & Confirmation</td><td>Reduces overbooking and substitutions</td><td>Large</td><td><span class="tag tag-p0">P0</span></td></tr>
        <tr><td>Payment Milestones & Invoicing</td><td>Improves cash flow; reduces errors</td><td>Medium</td><td><span class="tag tag-p0">P0</span></td></tr>
        <tr><td>Dynamic Seasonality & Margin Controls</td><td>Protects profitability in peak season</td><td>Medium</td><td><span class="tag tag-p1">P1</span></td></tr>
      </tbody>
    </table>

    <h3>Release C — Growth: Partners & Scale</h3>
    <table>
      <thead><tr><th>Feature</th><th>Impact</th><th>Effort</th><th>Priority</th></tr></thead>
      <tbody>
        <tr><td>B2B Travel Agent Portal</td><td>Opens indirect distribution channel</td><td>Large</td><td><span class="tag tag-p1">P1</span></td></tr>
        <tr><td>Owner Analytics Dashboard</td><td>Enables data-driven decisions</td><td>Medium</td><td><span class="tag tag-p2">P2</span></td></tr>
        <tr><td>Field Operations Mobile View</td><td>Reduces day-of-trip friction</td><td>Medium</td><td><span class="tag tag-p2">P2</span></td></tr>
      </tbody>
    </table>

    <div class="card card-highlight">
      <h3 style="color: var(--gold-light);">Why P0 Features First?</h3>
      <p>Faster quoting without confirmed supplier availability, payment tracking, and pricing governance does not reliably convert to revenue. Release B builds the operational backbone.</p>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">7 / 10</span></div>
</div>

<!-- PAGE 8: 6-MONTH TIMELINE -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Implementation Timeline</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>Six-Month Rollout Plan</h2>

    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-meta">Month 1–2</div>
        <div class="timeline-title">Release A + Foundation</div>
        <div class="timeline-content">WhatsApp/email threading, lead scoring, CRM alerts. Begin data model work for itineraries and supplier availability.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-meta">Month 2–3</div>
        <div class="timeline-title">Release B — Core Platform</div>
        <div class="timeline-content">Intelligent itinerary builder, supplier confirmation workflow, payment milestones, dynamic pricing rules.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-meta">Month 3–4</div>
        <div class="timeline-title">Integration & Hardening</div>
        <div class="timeline-content">Wire itinerary builder into PDFs, connect payment reminders, add review engine, load seasonality data, internal testing.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-meta">Month 4–5</div>
        <div class="timeline-title">Release C — B2B Portal</div>
        <div class="timeline-content">Agent table, API keys, co-branded PDFs, self-service portal, commission tracking.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-meta">Month 5–6</div>
        <div class="timeline-title">Analytics & Field Ops</div>
        <div class="timeline-content">Owner dashboard, mobile field-ops view, performance optimization, team training.</div>
      </div>
    </div>

    <h3>Implementation Principles</h3>
    <div class="card-grid">
      <div class="card"><h4>AI Writes, Code Computes</h4><p style="font-size: 8.5pt;">LLM handles prose. Deterministic code handles pricing, scheduling, and routing.</p></div>
      <div class="card"><h4>Manual First, API Later</h4><p style="font-size: 8.5pt;">Supplier confirmation starts with hold/confirm/release statuses before live integrations.</p></div>
      <div class="card"><h4>Immutable Invoices</h4><p style="font-size: 8.5pt;">Each invoice is a snapshot linked to a locked quote version.</p></div>
      <div class="card"><h4>Same Engine, B2B Skin</h4><p style="font-size: 8.5pt;">B2B portal reuses quoting engine with agent branding and commission rules.</p></div>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">8 / 10</span></div>
</div>

<!-- PAGE 9: TECHNICAL ARCHITECTURE -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Technical Architecture</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>New Modules & Data Model</h2>

    <h3>Module Structure Additions</h3>
    <div class="card" style="font-family: monospace; font-size: 8pt; line-height: 1.8; background: var(--bg-soft);">
src/
├── itineraries/      # Day planning, routing, validation
├── suppliers/        # Availability & confirmation workflows
├── payments/         # Invoices, milestones, reminders
├── communications/   # WhatsApp/email threading
├── b2b/              # Partner portal backend
├── analytics/        # Dashboard aggregations
└── pricing/          # Seasonality & margin rules
    </div>

    <h3>Key New Database Tables</h3>
    <table>
      <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
      <tbody>
        <tr><td>itinerary_days</td><td>Day-by-day trip plans with regions, distances, notes</td></tr>
        <tr><td>supplier_availabilities</td><td>Hold / confirm / release / blackout status per supplier-date</td></tr>
        <tr><td>payment_milestones</td><td>Deposit, balance, add-on invoices and payment status</td></tr>
        <tr><td>communications</td><td>WhatsApp/email inbound/outbound message log</td></tr>
        <tr><td>b2b_agents</td><td>Partner profiles, API keys, commission, branding</td></tr>
        <tr><td>pricing_rules</td><td>Seasonal multipliers, blackouts, margin controls</td></tr>
      </tbody>
    </table>

    <h3>Critical API Endpoints</h3>
    <div class="two-col">
      <div class="card" style="font-family: monospace; font-size: 8pt; line-height: 1.8;">
POST /api/itineraries/:tripId/generate<br>
GET  /api/itineraries/:tripId<br>
POST /api/suppliers/:id/availability<br>
POST /api/bookings/:id/hold<br>
POST /api/bookings/:id/confirm<br>
POST /api/bookings/:id/invoices
      </div>
      <div class="card" style="font-family: monospace; font-size: 8pt; line-height: 1.8;">
POST /api/payments/remind<br>
POST /api/webhooks/whatsapp<br>
POST /api/webhooks/email<br>
POST /api/b2b/quotes<br>
GET  /api/b2b/bookings<br>
GET  /api/analytics/dashboard
      </div>
    </div>

    <h3>UI Additions</h3>
    <ul>
      <li>Itinerary editor with day-by-day review and adjustments</li>
      <li>Supplier calendar view (holds, confirmations, blackouts)</li>
      <li>Booking detail page with payment milestone tracker</li>
      <li>Communications thread view per trip</li>
      <li>B2B partner management and analytics dashboard</li>
      <li>Mobile field-ops view for drivers/guides</li>
    </ul>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">9 / 10</span></div>
</div>

<!-- PAGE 10: SUCCESS METRICS & NEXT STEPS -->
<div class="page">
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">santos<span>.travel</span></div>
        <div class="brand-sub">Kerala · South India · Inbound Tours</div>
      </div>
      <div class="badge">Metrics & Next Steps</div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="content">
    <h2>Success Metrics</h2>

    <h3>Operational Efficiency</h3>
    <div class="progress-row"><div class="progress-label">Quote Time</div><div class="progress-track"><div class="progress-fill" style="width: 95%;"></div></div><div class="progress-value">&lt;30m</div></div>
    <div class="progress-row"><div class="progress-label">Itinerary Time</div><div class="progress-track"><div class="progress-fill" style="width: 85%;"></div></div><div class="progress-value">&lt;15m</div></div>
    <div class="progress-row"><div class="progress-label">Manual Entry</div><div class="progress-track"><div class="progress-fill" style="width: 60%;"></div></div><div class="progress-value">-50%</div></div>

    <h3>Revenue & Conversion</h3>
    <div class="card-grid">
      <div class="card metric"><div class="metric-value">+3–5%</div><div class="metric-label">Conversion Uplift</div></div>
      <div class="card metric"><div class="metric-value">3×</div><div class="metric-label">Inquiry Capacity</div></div>
      <div class="card metric"><div class="metric-value">$10M</div><div class="metric-label">Base-Case Revenue</div></div>
      <div class="card metric"><div class="metric-value">400</div><div class="metric-label">Private Trips/Year</div></div>
    </div>

    <h3>Customer Experience</h3>
    <ul>
      <li>Net Promoter Score (NPS) tracked post-trip</li>
      <li>Guest complaint rate, especially itinerary errors</li>
      <li>Pre-trip communication engagement rate</li>
    </ul>

    <h2>Immediate Next Steps</h2>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-title">Validate Baseline Metrics</div>
        <div class="timeline-content">Capture current quote time, conversion rate, revision count, and pricing error rate.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-title">Prioritize Release B</div>
        <div class="timeline-content">Begin itinerary builder, supplier confirmation, and payment milestones.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-title">Engage B2B Prospects</div>
        <div class="timeline-content">Identify 2–3 international travel-agent partners before building the portal.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-title">Apply for WhatsApp Business API</div>
        <div class="timeline-content">Start approval early to avoid communication rollout delays.</div>
      </div>
    </div>

    <div class="card card-highlight" style="text-align: center; margin-top: 24px;">
      <h3 style="color: var(--gold-light);">Recommended Decision</h3>
      <p>Approve Phase 2 development with a focus on Release B (Core Platform) first. This converts the quoting speed advantage into reliable, bookable revenue.</p>
    </div>
  </div>
  <div class="footer"><span>IVA Cortex Phase 2 Development Plan</span><span class="page-number">10 / 10</span></div>
</div>

</body>
</html>`;
}

module.exports = { buildDevelopmentPlanHtml };
