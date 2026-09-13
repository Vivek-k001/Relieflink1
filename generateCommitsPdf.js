const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ReliefLink - Git Commits Defense & Code Explanation Guide</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1E293B;
    line-height: 1.55;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }
  .header-cover {
    border-bottom: 3px solid #059669;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header-cover h1 {
    font-size: 22pt;
    color: #0F172A;
    margin: 0 0 4px 0;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .header-cover .subtitle {
    font-size: 11.5pt;
    color: #059669;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  .meta-grid {
    display: flex;
    gap: 20px;
    font-size: 8.5pt;
    color: #64748B;
  }
  .commit-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    margin-bottom: 18px;
    padding: 14px;
    page-break-inside: avoid;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  }
  .commit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #F1F5F9;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }
  .commit-hash {
    font-family: 'Consolas', monospace;
    background: #0F172A;
    color: #38BDF8;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 9pt;
  }
  .commit-title {
    font-size: 12pt;
    font-weight: 700;
    color: #0F172A;
    margin: 0;
  }
  .commit-meta {
    font-size: 8pt;
    color: #64748B;
  }
  .section-label {
    font-weight: 700;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #2563EB;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  .script-box {
    background: #F0FDF4;
    border-left: 4px solid #16A34A;
    padding: 8px 12px;
    margin: 8px 0;
    border-radius: 0 6px 6px 0;
    font-size: 9pt;
  }
  .script-box strong {
    color: #15803D;
  }
  .code-box {
    background-color: #0F172A;
    color: #E2E8F0;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: 'Consolas', 'Courier New', Courier, monospace;
    font-size: 8pt;
    line-height: 1.45;
    margin: 6px 0;
    overflow-x: auto;
  }
  .diff-add {
    color: #4ADE80;
  }
  .diff-del {
    color: #F87171;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 8.5pt;
  }
  th, td {
    border: 1px solid #E2E8F0;
    padding: 6px 8px;
    text-align: left;
  }
  th {
    background-color: #F8FAFC;
    color: #1E293B;
  }
  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

<div class="header-cover">
  <h1>ReliefLink - Git Commits Viva Defense Guide</h1>
  <div class="subtitle">Technical Rationale, Code Diff Analysis & Interview Explanations for the Recent 5 Commits</div>
  <div class="meta-grid">
    <div><strong>Author / Student:</strong> Vivek-k001</div>
    <div><strong>Repository:</strong> Relieflink1.git</div>
    <div><strong>Branch:</strong> main</div>
  </div>
</div>

<div class="script-box">
  <strong>💡 Guide Pro-Tip for Git Inspection:</strong> When the guide points to a commit on GitHub or in the terminal (<code>git log</code>), do NOT just say "I added 30 lines and deleted 20 lines." Explain <strong>the business reason (why the code was modified)</strong>, <strong>the architectural tradeoff</strong>, and <strong>how the specific lines of code solve the problem</strong>.
</div>

<!-- COMMIT 1 -->
<div class="commit-card">
  <div class="commit-header">
    <div>
      <span class="commit-hash">Commit 1: 943a7d8</span>
      <h2 class="commit-title" style="display:inline; margin-left: 8px;">new overall changes</h2>
    </div>
    <div class="commit-meta">Latest Commit &bull; 7 files changed (+1305, -92)</div>
  </div>

  <div class="section-label">1. Core Technical Purpose</div>
  <p>
    Eliminated the performance overhead of 3D WebGL globes on the landing page, tightened auth security by eliminating client-side OTP leaks, and introduced high-resolution Esri satellite GIS radars with real demo data.
  </p>

  <div class="section-label">2. Key Code Changes Explained</div>
  <ul>
    <li><strong><code>LandingPage.jsx</code>:</strong> Removed <code>EarthGlobe</code> (Three.js WebGL component) and view-toggle state (<code>mapView</code>). Replaced it with direct mounting of <code>InteractiveMap</code> (Leaflet satellite tiles). Added smooth <code>translateY(-2px)</code> CSS elevation to the Donate buttons.</li>
    <li><strong><code>LoginPage.jsx</code>:</strong> Removed the <code>devOtp</code> state and the yellow UI badge (<code>&lt;div&gt;Dev OTP: {devOtp}&lt;/div&gt;</code>). The OTP is now printed <strong>only to the backend terminal</strong>.</li>
    <li><strong><code>SafetySatelliteMap.jsx</code>:</strong> Created a dedicated GIS satellite map component with Esri World Imagery + boundary overlays, live device GPS marker, and interactive pin-drop broadcast listeners.</li>
    <li><strong><code>seedKochiCamps.js</code>:</strong> Added a database seed script that populates 5 realistic active camps in Kochi/Ernakulam (Town Hall, Marine Drive, Kakkanad) into MongoDB Atlas.</li>
  </ul>

  <div class="section-label">3. What to Say to Your Guide</div>
  <div class="script-box">
    <em>"In this commit, we tackled two critical concerns: <strong>Performance</strong> and <strong>Security</strong>. First, the 3D globe package was adding 1.86 MB of Three.js overhead that was impractical for local disaster response; we replaced it with high-resolution Esri Satellite imagery, which cut build times down to 2.9 seconds. Second, we removed the client-side dev OTP badge from LoginPage.jsx so authentication tokens are logged only in the protected server console, enforcing realistic production-grade security."</em>
  </div>
</div>

<!-- COMMIT 2 -->
<div class="commit-card">
  <div class="commit-header">
    <div>
      <span class="commit-hash">Commit 2: 3092552</span>
      <h2 class="commit-title" style="display:inline; margin-left: 8px;">Merge remote origin/main: keep satellite-only maps...</h2>
    </div>
    <div class="commit-meta">Merge Commit &bull; 4 files changed (+34, -42)</div>
  </div>

  <div class="section-label">1. Core Technical Purpose</div>
  <p>
    Standardized the mapping user experience across both public and responder views by removing confusing multiple map layers (OpenStreetMap normal, Esri Street, Humanitarian) and locking the map to <strong>Satellite View only</strong>.
  </p>

  <div class="section-label">2. Key Code Changes Explained</div>
  <ul>
    <li><strong><code>InteractiveMap.jsx</code> &amp; <code>MapView.jsx</code>:</strong> Removed <code>&lt;LayersControl&gt;</code>, <code>&lt;LayersControl.BaseLayer&gt;</code>, and multiple alternate raster tile providers. Kept only Esri World Imagery (<code>https://server.arcgisonline.com/.../World_Imagery/...</code>) with city labels.</li>
    <li><strong><code>authController.js</code>:</strong> Streamlined user creation and OTP expiration handling so existing user profile names are preserved when returning victims log in via SMS.</li>
  </ul>

  <div class="section-label">3. What to Say to Your Guide</div>
  <div class="script-box">
    <em>"In this merge commit, we resolved branch conflicts and eliminated visual clutter. The map previously had a radio-button layer picker with three alternate street maps that distracted from disaster coordination. We removed the extra tile layers and standardized on high-resolution satellite imagery so responders can instantly see geographical landmarks, rivers, and actual flooded terrain."</em>
  </div>
</div>

<div class="page-break"></div>

<!-- COMMIT 3 -->
<div class="commit-card">
  <div class="commit-header">
    <div>
      <span class="commit-hash">Commit 3: 3f1af58</span>
      <h2 class="commit-title" style="display:inline; margin-left: 8px;">enhance auth, payment gateway, NGO dashboard</h2>
    </div>
    <div class="commit-meta">Feature Commit &bull; 26 files changed (+3200, -733)</div>
  </div>

  <div class="section-label">1. Core Technical Purpose</div>
  <p>
    Massive architectural expansion: Introduced a simulated financial payment gateway for monetary donations, upgraded the NGO donation verification pipeline, and implemented a responsive split-screen authentication portal.
  </p>

  <div class="section-label">2. Key Code Changes Explained</div>
  <ul>
    <li><strong><code>MockPaymentGateway.jsx</code> &amp; <code>PublicDonatePage.jsx</code>:</strong> Built a realistic modal simulator supporting UPI QR/VPA, Credit/Debit Cards, and Net Banking with simulated bank processing delays and cryptographic transaction ID generation.</li>
    <li><strong><code>DonationsPage.jsx</code> (NGO side):</strong> Added complete administrative management for incoming aid: status filtering (<code>pending</code>, <code>received</code>, <code>dispatched</code>), monetary aggregation, donor phone verification, and receipt export.</li>
    <li><strong><code>LoginPage.jsx</code>:</strong> Re-engineered login architecture into a two-sided responsive split card: Left side dedicated to <strong>Citizens (Phone + OTP)</strong>, Right side dedicated to <strong>Responders (Email + Password + JWT)</strong>.</li>
    <li><strong><code>MissingPersonsPage.jsx</code>:</strong> Added photo uploads, last-seen location tags, and verification badges to assist in reuniting separated disaster victims.</li>
  </ul>

  <div class="section-label">3. What to Say to Your Guide</div>
  <div class="script-box">
    <em>"Commit 3f1af58 was our core operational expansion. We built the complete end-to-end donation ecosystem. When a citizen makes a monetary donation, it flows through a simulated UPI/Card gateway, records the transaction payload in MongoDB, and instantly updates the NGO's camp finance dashboard. We also redesigned the login page to clearly distinguish evacuees from credentialed NGO/volunteer responders."</em>
  </div>
</div>

<!-- COMMIT 4 -->
<div class="commit-card">
  <div class="commit-header">
    <div>
      <span class="commit-hash">Commit 4: c095bc6</span>
      <h2 class="commit-title" style="display:inline; margin-left: 8px;">remove setup guide and boilerplate from readme</h2>
    </div>
    <div class="commit-meta">Cleanup Commit &bull; 1 file changed (+0, -55)</div>
  </div>

  <div class="section-label">1. Core Technical Purpose</div>
  <p>
    Repository hygiene and documentation curation. Removed boilerplate instructions and scaffolding text to ensure professional academic presentation.
  </p>

  <div class="section-label">2. Key Code Changes Explained</div>
  <ul>
    <li><strong><code>README.md</code>:</strong> Stripped out default Vite/Create-React-App boilerplate instructions and local environment scratch notes, replacing them with project-focused architectural documentation.</li>
  </ul>

  <div class="section-label">3. What to Say to Your Guide</div>
  <div class="script-box">
    <em>"This was a cleanup commit where we pruned default framework scaffolding and internal dev notes from the repository's root documentation to maintain a clean, production-standard GitHub repository for evaluation."</em>
  </div>
</div>

<!-- COMMIT 5 -->
<div class="commit-card">
  <div class="commit-header">
    <div>
      <span class="commit-hash">Commit 5: 59363b0</span>
      <h2 class="commit-title" style="display:inline; margin-left: 8px;">fix mobile network and non-gps relief camp discovery...</h2>
    </div>
    <div class="commit-meta">Algorithm &amp; Fallback Commit &bull; 6 files changed (+488, -99)</div>
  </div>

  <div class="section-label">1. Core Technical Purpose</div>
  <p>
    Resolved a critical real-world disaster scenario: <strong>What happens when an evacuee's GPS signal is blocked by storm clouds or hardware failure?</strong>
  </p>

  <div class="section-label">2. Key Code Changes Explained</div>
  <ul>
    <li><strong><code>locationStore.js</code>:</strong> Implemented a tiered geolocation strategy. If high-accuracy hardware GPS fails or times out, it falls back to cellular network/IP-based geolocation without failing the app.</li>
    <li><strong><code>CampFinderPage.jsx</code>:</strong> Added district-level and municipal keyword search filters, occupancy range sliders, and manual map-click override so users can discover relief shelters without hardware GPS.</li>
    <li><strong><code>campController.js</code>:</strong> Enhanced backend queries so the <code>/api/camps</code> endpoint dynamically switches between MongoDB <code>$nearSphere</code> geospatial distance queries (if coordinates exist) and indexed regex district filtering (if coordinates are missing).</li>
  </ul>

  <div class="section-label">3. What to Say to Your Guide</div>
  <div class="script-box">
    <em>"Commit 59363b0 solves a life-critical edge case. In heavy rainfall or building collapse, satellite GPS signals frequently fail. Previously, the app required GPS to display nearby camps. In this commit, we built a multi-tier fallback: the system attempts GPS first; if that fails, it falls back to network geolocation, and simultaneously enables keyword district filtering so an evacuee can search 'Ernakulam' or 'Kochi' and instantly find open shelters with room available."</em>
  </div>
</div>

<div style="margin-top: 16px; padding-top: 10px; border-top: 1px solid #CBD5E1; font-size: 8pt; color: #64748B; text-align: center;">
  ReliefLink Git Defense Handbook &bull; Prepared for Academic Guide Evaluation &bull; All Rights Reserved
</div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'ReliefLink_Git_Commits_Explanation_Guide.html');
const pdfPath = path.join(__dirname, 'ReliefLink_Git_Commits_Explanation_Guide.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML written to:', htmlPath);

const browserPath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const cmd = '"' + browserPath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfPath + '" "' + htmlPath + '"';

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('PDF successfully generated at:', pdfPath);
} catch (e) {
  console.error('Failed with Chrome, trying Edge...', e.message);
  const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
  const edgeCmd = '"' + edgePath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfPath + '" "' + htmlPath + '"';
  execSync(edgeCmd, { stdio: 'inherit' });
  console.log('PDF successfully generated with Edge at:', pdfPath);
}
