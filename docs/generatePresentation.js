const pptxgen = require('pptxgenjs');
const path = require('path');

async function createPresentation() {
  const pres = new pptxgen();

  // Configure true 16:9 Widescreen (13.333" x 7.5")
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'ReliefLink - Technical Presentation';
  pres.author = 'Vivek';
  pres.company = 'ReliefLink';

  // Professional Light / Normal Theme Palette
  const BG_COLOR = 'F8FAFC';        // Slate 50 (Clean crisp off-white canvas)
  const CARD_BG = 'FFFFFF';         // Pure White Cards
  const CARD_BORDER = 'E2E8F0';     // Slate 200 Card Borders
  const HERO_CARD_BG = 'EFF6FF';    // Subtle Royal Blue Tint for Highlights
  const HERO_BORDER = 'BFDBFE';     // Blue 200
  
  const TEXT_DARK = '0F172A';       // Slate 900 (High-contrast deep dark text)
  const TEXT_BODY = '334155';       // Slate 700 (Readable paragraph text)
  const TEXT_MUTED = '64748B';      // Slate 500 (Subtitles & secondary notes)
  
  const ACCENT_BLUE = '2563EB';     // Primary Blue 600
  const ACCENT_GREEN = '059669';    // Emerald Green 600
  const ACCENT_RED = 'DC2626';      // Red 600 (Emergency alerts)
  const ACCENT_AMBER = 'D97706';    // Amber 600 (Warnings & inventory)
  const TABLE_HEADER_BG = '1E293B'; // Deep Slate for Table Headers
  const TABLE_HEADER_TXT = 'FFFFFF';// White text for headers

  // Helper for Slide Background & Top Header Tag
  function applyBaseLayout(slide, category = 'RELIEFLINK ARCHITECTURE') {
    slide.background = { color: BG_COLOR };
    // Top category badge
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.45, w: 9.0, h: 0.25,
      fontSize: 10, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri'
    });
  }

  // ==========================================
  // SLIDE 1: Title Slide (Normal Light Theme)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: BG_COLOR };

    // Clean Centered Hero Card Container
    slide.addShape(pres.ShapeType.rect, {
      x: 1.0, y: 1.2, w: 11.33, h: 5.1,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.5 },
      rectRadius: 0.15
    });

    // Top Brand Pill
    slide.addShape(pres.ShapeType.rect, {
      x: 1.5, y: 1.65, w: 3.2, h: 0.35,
      fill: { color: HERO_CARD_BG },
      line: { color: HERO_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('MISSION-CRITICAL RELIEF TECH', {
      x: 1.5, y: 1.65, w: 3.2, h: 0.35,
      fontSize: 9.5, color: ACCENT_BLUE, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('ReliefLink 🌍🤝', {
      x: 1.5, y: 2.15, w: 10.3, h: 0.8,
      fontSize: 40, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    slide.addText('Real-Time Disaster Response & Humanitarian Relief Coordination Platform', {
      x: 1.5, y: 3.0, w: 10.3, h: 0.45,
      fontSize: 18, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri'
    });

    slide.addText(
      'An enterprise-grade MERN-stack and Satellite GIS ecosystem connecting stranded victims, specialized rescue volunteer squads, NGO relief shelters, and humanitarian donors via live geospatial coordination and sub-second dispatch.',
      {
        x: 1.5, y: 3.6, w: 10.3, h: 1.0,
        fontSize: 13, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 20
      }
    );

    // Separator line
    slide.addShape(pres.ShapeType.line, {
      x: 1.5, y: 4.9, w: 10.3, h: 0,
      line: { color: CARD_BORDER, width: 1 }
    });

    // Footer Author & Platform Tag
    slide.addText('Author: Vivek   |   Platform: Web-Based Full-Stack MERN   |   Real-Time Engine: WebSockets', {
      x: 1.5, y: 5.15, w: 10.3, h: 0.4,
      fontSize: 11, color: ACCENT_GREEN, bold: true, fontFace: 'Calibri'
    });
  }

  // ==========================================
  // SLIDE 2: Problem Reality vs Core Objectives
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'MISSION & CORE OBJECTIVES');

    slide.addText('In Humanitarian Emergencies, Coordination Gaps Cost Lives', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    // Left Column: The Critical Reality
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.5, w: 5.6, h: 5.3,
      fill: { color: CARD_BG },
      line: { color: 'FECACA', width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText('⚠️ The Critical Reality (Legacy Failures)', {
      x: 1.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_RED, bold: true, fontFace: 'Calibri'
    });

    const realityPoints = [
      { bold: 'Broken Lifelines: ', norm: 'No direct distress channel; frantic social media forwards overload phone lines and delay urgent medical rescue.' },
      { bold: 'Blind Deployment: ', norm: 'Rescue squads lack live geospatial intelligence, terrain flood maps, and localized shelter occupancy data.' },
      { bold: 'Supply Chaos: ', norm: 'Severe stockouts in cutoff remote relief camps while accessible urban shelters receive surplus rations.' }
    ];
    realityPoints.forEach((p, idx) => {
      slide.addText([
        { text: p.bold, options: { bold: true, color: TEXT_DARK } },
        { text: p.norm, options: { color: TEXT_BODY } }
      ], {
        x: 1.1, y: 2.35 + (idx * 1.35), w: 5.0, h: 1.2,
        fontSize: 12, fontFace: 'Calibri', lineSpacing: 18
      });
    });

    // Right Column: Core Engineering Objectives
    slide.addShape(pres.ShapeType.rect, {
      x: 6.8, y: 1.5, w: 5.7, h: 5.3,
      fill: { color: CARD_BG },
      line: { color: 'A7F3D0', width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText('🎯 Core Engineering Objectives', {
      x: 7.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_GREEN, bold: true, fontFace: 'Calibri'
    });

    const objectives = [
      { num: '01', title: 'Sub-Second SOS Broadcast', desc: 'Connect victims, NGOs, and field volunteers in < 2 seconds using Socket.io WebSockets.' },
      { num: '02', title: 'Smart Proximity Task Matching', desc: 'Automatically match field tasks based on proximity, first-aid skills, and vehicle availability.' },
      { num: '03', title: 'Algorithmic Donation Routing', desc: 'Route financial and supply donations directly to the highest-need shelters using Haversine formulas.' }
    ];
    objectives.forEach((obj, idx) => {
      slide.addShape(pres.ShapeType.rect, {
        x: 7.1, y: 2.45 + (idx * 1.35), w: 0.55, h: 0.45,
        fill: { color: 'DCFCE7' },
        line: { color: '86EFAC', width: 1 },
        rectRadius: 0.05
      });
      slide.addText(obj.num, {
        x: 7.1, y: 2.45 + (idx * 1.35), w: 0.55, h: 0.45,
        fontSize: 13, color: ACCENT_GREEN, bold: true, align: 'center', valign: 'middle', fontFace: 'Arial'
      });

      slide.addText([
        { text: obj.title + '\n', options: { bold: true, color: TEXT_DARK, fontSize: 13 } },
        { text: obj.desc, options: { color: TEXT_BODY, fontSize: 11 } }
      ], {
        x: 7.8, y: 2.45 + (idx * 1.35), w: 4.5, h: 1.2,
        fontFace: 'Calibri', lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 3: Problem vs Solution Architecture
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'SYSTEM ADVANTAGE & ARCHITECTURAL SHIFT');

    slide.addText('Informal Channels Create Chaos; Centralized Telemetry Saves Lives', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    // 4 Problem Cards (2 columns x 2 rows)
    const problems = [
      { title: 'Fragmented Comms', desc: 'Viral forwards & WhatsApp audio cause duplication, false alarms, and responder fatigue.' },
      { title: 'Paper Ledgers', desc: 'Handwritten logs lead to delayed warehouse reorders and critical life-support stockouts.' },
      { title: 'Opaque Donations', desc: 'Relief money flows without visibility into specific camp shortages or urgent needs.' },
      { title: '4 to 8-Hour Delays', desc: 'Slow bureaucratic response leaves stranded flood victims without aid in critical hours.' }
    ];

    problems.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + (col * 2.85);
      const y = 1.5 + (row * 2.7);

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: 2.65, h: 2.5,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.2 },
        rectRadius: 0.1
      });

      slide.addText(item.title, {
        x: x + 0.2, y: y + 0.25, w: 2.25, h: 0.4,
        fontSize: 13, color: ACCENT_AMBER, bold: true, fontFace: 'Calibri'
      });
      slide.addText(item.desc, {
        x: x + 0.2, y: y + 0.75, w: 2.25, h: 1.55,
        fontSize: 11, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 16
      });
    });

    // Right Big Panel: ReliefLink Solution
    slide.addShape(pres.ShapeType.rect, {
      x: 6.7, y: 1.5, w: 5.8, h: 5.2,
      fill: { color: HERO_CARD_BG },
      line: { color: ACCENT_BLUE, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText('ReliefLink Advantages vs Legacy Systems', {
      x: 7.0, y: 1.8, w: 5.2, h: 0.4,
      fontSize: 16, color: ACCENT_BLUE, bold: true, fontFace: 'Arial'
    });

    const solPoints = [
      { icon: '📍', title: '1-Click GPS SOS Beacon', text: 'Victims pin exact location instantly via device GPS or cell tower fallback.' },
      { icon: '📡', title: 'Sub-Second Volunteer Radar', text: 'Real-time WebSocket alerts notify nearest qualified field volunteers.' },
      { icon: '📦', title: 'Dynamic Supply Ledger', text: 'Automated inventory updates prevent warehouse starvation and stockouts.' },
      { icon: '🎯', title: 'Geo-Proximity Smart Giving', text: 'Haversine algorithmic routing connects donors to the most desperate shelters.' }
    ];

    solPoints.forEach((sp, idx) => {
      slide.addText(`${sp.icon} ${sp.title}`, {
        x: 7.0, y: 2.4 + (idx * 1.05), w: 5.2, h: 0.3,
        fontSize: 12, color: TEXT_DARK, bold: true, fontFace: 'Calibri'
      });
      slide.addText(sp.text, {
        x: 7.3, y: 2.75 + (idx * 1.05), w: 4.8, h: 0.6,
        fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri'
      });
    });
  }

  // ==========================================
  // SLIDE 4: Decoupled Full-Stack Architecture
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'SYSTEM ARCHITECTURE & TIERS');

    slide.addText('Decoupled Full-Stack Architecture for Mission-Critical Reliability', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const tiers = [
      {
        num: '1', name: 'Presentation Tier', color: ACCENT_BLUE, boxBg: 'DBEAFE',
        tech: 'React 18 + Vite + Leaflet GIS',
        desc: 'High-Resolution Esri Satellite Maps, Live GIS Heatmaps, Zustand client store, and trilingual i18n support.'
      },
      {
        num: '2', name: 'Dispatch & Real-Time Tier', color: ACCENT_GREEN, boxBg: 'DCFCE7',
        tech: 'Socket.io WebSockets + Web Push VAPID',
        desc: 'Instant distress broadcasting, volunteer geo-location telemetry, and live early warning broadcasts.'
      },
      {
        num: '3', name: 'Application & Logic Tier', color: ACCENT_AMBER, boxBg: 'FEF3C7',
        tech: 'Node.js v18+ & Express.js REST API',
        desc: 'Stateless JWT & phone OTP auth engine, Haversine routing algorithms, and camp inventory ledgers.'
      },
      {
        num: '4', name: 'Persistence Tier', color: ACCENT_RED, boxBg: 'FEE2E2',
        tech: 'MongoDB Atlas + 2dsphere Geospatial Indexing',
        desc: 'High-speed $near spherical queries, resilient NoSQL document models, and dynamic inventory schemas.'
      }
    ];

    tiers.forEach((tier, idx) => {
      const y = 1.5 + (idx * 1.35);
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y, w: 11.7, h: 1.18,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 1.05, y: y + 0.25, w: 0.65, h: 0.65,
        fill: { color: tier.boxBg },
        line: { color: tier.color, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(tier.num, {
        x: 1.05, y: y + 0.25, w: 0.65, h: 0.65,
        fontSize: 16, color: tier.color, bold: true, align: 'center', valign: 'middle'
      });

      slide.addText(tier.name, {
        x: 1.9, y: y + 0.18, w: 3.5, h: 0.35,
        fontSize: 14, color: TEXT_DARK, bold: true, fontFace: 'Calibri'
      });
      slide.addText(tier.tech, {
        x: 1.9, y: y + 0.58, w: 3.5, h: 0.45,
        fontSize: 11, color: tier.color, bold: true, fontFace: 'Calibri'
      });

      slide.addText(tier.desc, {
        x: 5.6, y: y + 0.22, w: 6.6, h: 0.75,
        fontSize: 11.5, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 5: Four Interconnected Stakeholders
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'STAKEHOLDER ROLES & VALUE MATRIX');

    slide.addText('Four Interconnected Stakeholders Coordinated on One Live Canvas', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const stakeholders = [
      {
        role: 'Affected Citizens', icon: '🆘', color: ACCENT_RED, border: 'FECACA',
        points: ['Low-friction Phone OTP verification', '1-Click GPS SOS Emergency Beacon', 'Interactive Relief Camp Locator', 'Personal safety pin-drop on GIS map']
      },
      {
        role: 'Field Rescue Volunteers', icon: '🦺', color: ACCENT_BLUE, border: 'BFDBFE',
        points: ['Registered skills (First Aid, Rescue, Logistics)', 'Real-time SOS incident radar & visual alert toasts', 'Turn-by-turn navigation to victims', 'Task lifecycle updates (En Route, Rescued)']
      },
      {
        role: 'NGO Camp Administrators', icon: '🏕️', color: ACCENT_GREEN, border: 'A7F3D0',
        points: ['Shelter capacity & live occupancy monitoring', '5-category inventory control & auto-deduction', 'High-priority regional disaster broadcasts', 'Volunteer deployment & mission assignments']
      },
      {
        role: 'Public Donors', icon: '💳', color: ACCENT_AMBER, border: 'FDE68A',
        points: ['Instant digital payments (UPI / Card)', 'Haversine-routed targeted support to dry camps', 'Full transparency: direct inventory crediting', 'Instant verifiable digital donation receipts']
      }
    ];

    const cardW = 2.75;
    const spacing = 0.23;

    stakeholders.forEach((sh, idx) => {
      const x = 0.8 + (idx * (cardW + spacing));
      slide.addShape(pres.ShapeType.rect, {
        x, y: 1.5, w: cardW, h: 5.3,
        fill: { color: CARD_BG },
        line: { color: sh.border, width: 1.5 },
        rectRadius: 0.1
      });

      slide.addText(`${sh.icon} ${sh.role}`, {
        x: x + 0.2, y: 1.75, w: cardW - 0.4, h: 0.6,
        fontSize: 13, color: sh.color, bold: true, fontFace: 'Calibri'
      });

      sh.points.forEach((pt, pIdx) => {
        slide.addText(`• ${pt}`, {
          x: x + 0.2, y: 2.5 + (pIdx * 1.05), w: cardW - 0.4, h: 0.95,
          fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 15
        });
      });
    });
  }

  // ==========================================
  // SLIDE 6: Role-Based Access Control (RBAC Table)
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'SECURITY & PRIVILEGE MATRIX');

    slide.addText('Strict Privileges and Operational Scopes (RBAC Matrix)', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const headers = [
      { text: 'Role', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Authentication Method', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Core Capabilities', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Key Deliverables & Telemetry', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } }
    ];

    const rows = [
      [
        { text: 'Affected Citizen', options: { bold: true, color: ACCENT_RED, fill: CARD_BG } },
        { text: 'Instant Phone OTP (Low friction in panic)', options: { fill: CARD_BG } },
        { text: 'SOS broadcast, safe status, shelter search, aid request', options: { fill: CARD_BG } },
        { text: 'GPS coordinates, distress level, family safety logs', options: { fill: CARD_BG } }
      ],
      [
        { text: 'Field Volunteer', options: { bold: true, color: ACCENT_BLUE, fill: 'F8FAFC' } },
        { text: 'Email + Password (JWT token)', options: { fill: 'F8FAFC' } },
        { text: 'Real-time task radar, accept rescue, route navigation', options: { fill: 'F8FAFC' } },
        { text: 'Delivery status, live location updates, mission reports', options: { fill: 'F8FAFC' } }
      ],
      [
        { text: 'Camp Admin / NGO', options: { bold: true, color: ACCENT_GREEN, fill: CARD_BG } },
        { text: 'Organizational JWT (Role-guarded)', options: { fill: CARD_BG } },
        { text: 'Camp triage, inventory ledger, aid approvals, alerts', options: { fill: CARD_BG } },
        { text: 'Stock alerts, capacity logs, disaster broadcasts', options: { fill: CARD_BG } }
      ],
      [
        { text: 'Public Donor', options: { bold: true, color: ACCENT_AMBER, fill: 'F8FAFC' } },
        { text: 'Guest Session / JWT', options: { fill: 'F8FAFC' } },
        { text: 'Choose recommended camp, donate goods or funds', options: { fill: 'F8FAFC' } },
        { text: 'Payment transaction reference, item receipt ledger', options: { fill: 'F8FAFC' } }
      ]
    ];

    slide.addTable([headers, ...rows], {
      x: 0.8, y: 1.5, w: 11.7, h: 5.2,
      colW: [2.2, 2.8, 3.8, 2.9],
      fontSize: 10.5,
      color: TEXT_BODY,
      border: { pt: 1, color: CARD_BORDER },
      valign: 'middle',
      fontFace: 'Calibri'
    });
  }

  // ==========================================
  // SLIDE 7: Real-Time GIS Telemetry & Mechanics
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'GEOSPATIAL INTELLIGENCE & TELEMETRY');

    slide.addText('Real-Time GIS Telemetry for Precision Search-and-Rescue', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    // Left Column: 3 Visual Capabilities
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.5, w: 5.6, h: 5.3,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('🛰️ GIS Visual Capabilities', {
      x: 1.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri'
    });

    const gisFeatures = [
      { title: 'Live GIS Heatmap & Radar Clustering', desc: 'Dynamic kernel density clustering via Leaflet.heat highlighting high-intensity emergency zones and rescue corridors.' },
      { title: 'Dual-Layer Satellite GIS (Esri)', desc: 'Combines Esri World Imagery with street reference layers for high-resolution ground flood assessment.' },
      { title: 'Pulsing Marker Pinning & Route Tracking', desc: 'Custom CSS keyframe divIcons (pulse-sos, pulse-target) and real-time turn-by-turn responder navigation.' }
    ];

    gisFeatures.forEach((f, idx) => {
      slide.addText([
        { text: f.title + '\n', options: { bold: true, color: TEXT_DARK, fontSize: 13 } },
        { text: f.desc, options: { color: TEXT_BODY, fontSize: 11 } }
      ], {
        x: 1.1, y: 2.35 + (idx * 1.35), w: 5.0, h: 1.2,
        fontFace: 'Calibri', lineSpacing: 16
      });
    });

    // Right Column: Engineering Mechanics
    slide.addShape(pres.ShapeType.rect, {
      x: 6.8, y: 1.5, w: 5.7, h: 5.3,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('📐 Engineering Mechanics', {
      x: 7.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_GREEN, bold: true, fontFace: 'Calibri'
    });

    const mechanics = [
      { num: '01', title: 'High-Accuracy Geolocation', desc: 'HTML5 Navigator GPS with smart IP/Cell tower fallback to prevent timeouts in disaster zones.' },
      { num: '02', title: 'MongoDB 2dsphere Spatial Querying', desc: '$near and $maxDistance geospatial spherical index queries calculate nearest relief resources instantly.' },
      { num: '03', title: 'Haversine Spherical Trigonometry', desc: 'Computes great-circle distance over Earth curvature to match donors with high-priority shelters.' }
    ];

    mechanics.forEach((m, idx) => {
      slide.addShape(pres.ShapeType.rect, {
        x: 7.1, y: 2.45 + (idx * 1.35), w: 0.55, h: 0.45,
        fill: { color: 'DCFCE7' },
        line: { color: '86EFAC', width: 1 },
        rectRadius: 0.05
      });
      slide.addText(m.num, {
        x: 7.1, y: 2.45 + (idx * 1.35), w: 0.55, h: 0.45,
        fontSize: 13, color: ACCENT_GREEN, bold: true, align: 'center', valign: 'middle', fontFace: 'Arial'
      });

      slide.addText([
        { text: m.title + '\n', options: { bold: true, color: TEXT_DARK, fontSize: 13 } },
        { text: m.desc, options: { color: TEXT_BODY, fontSize: 11 } }
      ], {
        x: 7.8, y: 2.45 + (idx * 1.35), w: 4.5, h: 1.2,
        fontFace: 'Calibri', lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 8: Dynamic Inventory & Algorithmic Allocation
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'RESOURCE ALLOCATION & AUTOMATION');

    slide.addText('Algorithmic Resource Allocation Eliminates Shelter Starvation', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    // Left Box: Inventory Ledger
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8, y: 1.5, w: 5.6, h: 5.3,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('📦 Dynamic Camp Inventory Ledger', {
      x: 1.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_AMBER, bold: true, fontFace: 'Calibri'
    });

    slide.addText('5 Essential Humanitarian Categories:', {
      x: 1.1, y: 2.35, w: 5.0, h: 0.3,
      fontSize: 12, color: TEXT_DARK, bold: true, fontFace: 'Calibri'
    });
    slide.addText('1. Drinking Water (L)   •   2. Packaged Rations (kg)\n3. Medical Kits (units)   •   4. Baby Food (kg)   •   5. Blankets', {
      x: 1.1, y: 2.7, w: 5.0, h: 0.6,
      fontSize: 11, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri', lineSpacing: 16
    });

    slide.addText('Auto-Decrement & Restocking Pipeline:', {
      x: 1.1, y: 3.45, w: 5.0, h: 0.3,
      fontSize: 12, color: TEXT_DARK, bold: true, fontFace: 'Calibri'
    });
    slide.addText('• When NGO approves an aid delivery, camp warehouse stock is automatically decremented in real time.\n• When public donation is acknowledged, goods are automatically credited to camp inventory without manual data entry.', {
      x: 1.1, y: 3.8, w: 5.0, h: 1.1,
      fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 16
    });

    slide.addText('Buffer Threshold Red Alerts:', {
      x: 1.1, y: 5.1, w: 5.0, h: 0.3,
      fontSize: 12, color: ACCENT_RED, bold: true, fontFace: 'Calibri'
    });
    slide.addText('When essential rations dip below 20% minimum buffer, automated red alerts are broadcast to response coordinators and donors.', {
      x: 1.1, y: 5.45, w: 5.0, h: 0.8,
      fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri'
    });

    // Right Box: Smart Donation Algorithm
    slide.addShape(pres.ShapeType.rect, {
      x: 6.8, y: 1.5, w: 5.7, h: 5.3,
      fill: { color: HERO_CARD_BG },
      line: { color: HERO_BORDER, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText('🎯 Smart Donation Allocation Algorithm', {
      x: 7.1, y: 1.8, w: 5.0, h: 0.4,
      fontSize: 15, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri'
    });

    slide.addText([
      { text: 'The Disaster Paradox:\n', options: { bold: true, color: TEXT_DARK, fontSize: 13 } },
      { text: 'During catastrophic events, public donors overwhelm well-publicized urban centers while smaller, cutoff camps face acute shortages.\n\n', options: { color: TEXT_BODY, fontSize: 11 } },
      { text: 'ReliefLink Routing Logic:\n', options: { bold: true, color: ACCENT_GREEN, fontSize: 13 } },
      { text: '1. Ingests donor GPS coordinates via browser location.\n2. Computes distance to all active camps via Haversine formula.\n3. Calculates camp urgency ratio: (Capacity - Current Occupancy) + Critical Shortage Index.\n4. Recommends highest-priority target camp with visual map focus and automated inventory allocation.\n\n', options: { color: TEXT_BODY, fontSize: 11, lineSpacing: 18 } },
      { text: 'Result: Zero supply waste and balanced regional resource distribution.', options: { bold: true, color: ACCENT_BLUE, fontSize: 11 } }
    ], {
      x: 7.1, y: 2.35, w: 5.1, h: 4.2,
      fontFace: 'Calibri'
    });
  }

  // ==========================================
  // SLIDE 9: Scalable NoSQL Data Models (Table)
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'DATABASE DESIGN & SCHEMA OPTIMIZATION');

    slide.addText('Scalable NoSQL Data Models for High-Speed Telemetry', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const schemaHeaders = [
      { text: 'Collection', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Core Schema Fields', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Index Strategy', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } },
      { text: 'Role in Emergency Pipeline', options: { bold: true, color: TABLE_HEADER_TXT, fill: TABLE_HEADER_BG } }
    ];

    const schemaRows = [
      [
        { text: 'Users', options: { bold: true, color: ACCENT_BLUE, fill: CARD_BG } },
        { text: 'name, phone, email, passwordHash, role, skills, vehicleType', options: { fill: CARD_BG } },
        { text: 'unique (phone/email), role index', options: { fill: CARD_BG } },
        { text: 'Identity verification & volunteer dispatch', options: { fill: CARD_BG } }
      ],
      [
        { text: 'SosRequests', options: { bold: true, color: ACCENT_RED, fill: 'F8FAFC' } },
        { text: 'userId, location (GeoJSON Point), priority, disasterType, status', options: { fill: 'F8FAFC' } },
        { text: '2dsphere (location), status index', options: { fill: 'F8FAFC' } },
        { text: 'Sub-second search-and-rescue matching', options: { fill: 'F8FAFC' } }
      ],
      [
        { text: 'ReliefCamps', options: { bold: true, color: ACCENT_GREEN, fill: CARD_BG } },
        { text: 'name, location, capacity, currentOccupancy, managedBy, facilities', options: { fill: CARD_BG } },
        { text: '2dsphere (location), managedBy', options: { fill: CARD_BG } },
        { text: 'Shelter capacity management & safe routing', options: { fill: CARD_BG } }
      ],
      [
        { text: 'Inventory', options: { bold: true, color: ACCENT_AMBER, fill: 'F8FAFC' } },
        { text: 'campId, itemName, category, quantity, unit, minThreshold', options: { fill: 'F8FAFC' } },
        { text: 'compound (campId, category)', options: { fill: 'F8FAFC' } },
        { text: 'Camp supply ledger & automated stock alerts', options: { fill: 'F8FAFC' } }
      ],
      [
        { text: 'Donations', options: { bold: true, color: TEXT_DARK, fill: CARD_BG } },
        { text: 'donorName, type (goods/monetary), amount, items, campId, status', options: { fill: CARD_BG } },
        { text: 'campId, status, createdAt', options: { fill: CARD_BG } },
        { text: 'Transparent aid tracking & inventory credits', options: { fill: CARD_BG } }
      ],
      [
        { text: 'DisasterAlerts', options: { bold: true, color: ACCENT_RED, fill: 'F8FAFC' } },
        { text: 'title, severity, affectedAreas, issuedBy, expiresAt', options: { fill: 'F8FAFC' } },
        { text: 'TTL index (expiresAt)', options: { fill: 'F8FAFC' } },
        { text: 'Early warning radar & weather notifications', options: { fill: 'F8FAFC' } }
      ]
    ];

    slide.addTable([schemaHeaders, ...schemaRows], {
      x: 0.8, y: 1.5, w: 11.7, h: 5.2,
      colW: [1.9, 4.4, 2.5, 2.9],
      fontSize: 10,
      color: TEXT_BODY,
      border: { pt: 1, color: CARD_BORDER },
      valign: 'middle',
      fontFace: 'Calibri'
    });
  }

  // ==========================================
  // SLIDE 10: Full-Stack Tech Stack (2x2 Grid)
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'TECHNOLOGY ECOSYSTEM & STACK');

    slide.addText('Modern, Resilient Full-Stack Technologies Built for Reliability', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const pillars = [
      {
        title: 'Frontend & Visualization', color: ACCENT_BLUE, border: 'BFDBFE',
        items: [
          'Framework: React 18 + Vite (Lightning HMR)',
          'GIS Mapping: Leaflet.js + React-Leaflet',
          'Satellite Tiles: Esri World Imagery',
          'Density Heatmaps: Leaflet.heat dynamic layer',
          'State Store: Zustand (1KB zero-boilerplate)'
        ]
      },
      {
        title: 'Backend & Real-Time Engine', color: ACCENT_GREEN, border: 'A7F3D0',
        items: [
          'Server Runtime: Node.js v18+ & Express.js',
          'Real-Time Dispatch: Socket.io WebSockets',
          'Push Engine: Web Push API (VAPID)',
          'Security: Helmet + Rate Limiter + Strict CORS',
          'Process Mgmt: Concurrently / Nodemon'
        ]
      },
      {
        title: 'Data & Geospatial Layer', color: ACCENT_AMBER, border: 'FDE68A',
        items: [
          'Cloud Database: MongoDB Atlas',
          'ODM: Mongoose with strict schema validation',
          'Geospatial: GeoJSON Point + 2dsphere indexing',
          'Query Operators: $near, $geometry, $maxDistance',
          'Connection: DNS IPv4 auto-fallback resolver'
        ]
      },
      {
        title: 'Field Resilience & Tooling', color: ACCENT_RED, border: 'FECACA',
        items: [
          'Authentication: Stateless JWT + Phone OTP',
          'Weather API: OpenWeatherMap / IMD Radar',
          'Language i18n: English, Malayalam, Hindi',
          'Styling: Custom Responsive Glassmorphism CSS',
          'Mobile Support: Self-signed SSL for phone GPS'
        ]
      }
    ];

    const cardW = 5.7;
    const cardH = 2.5;

    pillars.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + (col * 6.0);
      const y = 1.5 + (row * 2.7);

      slide.addShape(pres.ShapeType.rect, {
        x, y, w: cardW, h: cardH,
        fill: { color: CARD_BG },
        line: { color: p.border, width: 1.5 },
        rectRadius: 0.1
      });

      slide.addText(p.title, {
        x: x + 0.3, y: y + 0.2, w: cardW - 0.6, h: 0.35,
        fontSize: 14, color: p.color, bold: true, fontFace: 'Calibri'
      });

      p.items.forEach((item, iIdx) => {
        slide.addText(`• ${item}`, {
          x: x + 0.3, y: y + 0.65 + (iIdx * 0.34), w: cardW - 0.6, h: 0.32,
          fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri'
        });
      });
    });
  }

  // ==========================================
  // SLIDE 11: Future Enhancements & Roadmap (5 Horizontal Bars)
  // ==========================================
  {
    const slide = pres.addSlide();
    applyBaseLayout(slide, 'FUTURE ROADMAP & SYSTEM EVOLUTION');

    slide.addText('Future Enhancements & Research Roadmap', {
      x: 0.8, y: 0.75, w: 11.7, h: 0.55,
      fontSize: 22, color: TEXT_DARK, bold: true, fontFace: 'Arial'
    });

    const roadmap = [
      {
        icon: '🤖', title: 'Predictive ML Demand Forecasting',
        desc: 'Train machine learning models on meteorological flood history to predict camp inventory shortages 48 hours prior to landfall.'
      },
      {
        icon: '🚁', title: 'Autonomous Drone Waypoint Dispatch',
        desc: 'Integrate drone telemetry APIs to deliver urgent medical kits and clean drinking water packets to cutoff topological islands.'
      },
      {
        icon: '📶', title: 'Offline Mesh SOS Relay',
        desc: 'Deploy Bluetooth Low Energy (BLE) peer-to-peer mesh protocols allowing citizens to relay distress beacons without cellular towers.'
      },
      {
        icon: '🗣️', title: 'Trilingual Accessibility & Voice AI',
        desc: 'Expand support to regional Indian dialects with AI speech-to-text allowing illiterate flood victims to speak their SOS distress call.'
      },
      {
        icon: '📱', title: 'High-Stress Low-Bandwidth PWA',
        desc: 'Progressive Web App with Service Worker offline caching for flawless operation on 2G edge networks in devastated disaster zones.'
      }
    ];

    roadmap.forEach((r, idx) => {
      const y = 1.5 + (idx * 1.05);
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8, y, w: 11.7, h: 0.92,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addText(r.icon, {
        x: 1.0, y: y + 0.15, w: 0.5, h: 0.55,
        fontSize: 20
      });

      slide.addText(r.title, {
        x: 1.65, y: y + 0.15, w: 4.5, h: 0.3,
        fontSize: 13, color: ACCENT_BLUE, bold: true, fontFace: 'Calibri'
      });

      slide.addText(r.desc, {
        x: 1.65, y: y + 0.45, w: 10.5, h: 0.42,
        fontSize: 10.5, color: TEXT_BODY, fontFace: 'Calibri'
      });
    });
  }

  // Save the presentation
  const outputPath = path.join(__dirname, 'ReliefLink_Comprehensive_Technical_Presentation.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log(`✅ PowerPoint presentation with fixed alignments successfully generated at: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error('❌ Error creating presentation:', err);
  process.exit(1);
});
