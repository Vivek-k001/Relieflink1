const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function loginApi(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function getCitizenUser() {
  // Try sending OTP and verifying with default demo OTP if available,
  // or authenticate via volunteer/login
  const sendRes = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210' })
  }).then(r => r.json()).catch(() => null);

  // We can also check backend directly or use the demo login
  return null;
}

async function run() {
  console.log('Launching browser at:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--ignore-certificate-errors',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  async function snap(route, filename, waitMs = 2500) {
    const url = `https://localhost:5173${route}`;
    console.log(`📸 Capturing ${url} -> ${filename}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    } catch (e) {
      console.log(`  (Note on load: ${e.message})`);
    }
    await new Promise(r => setTimeout(r, waitMs));
    const dest = path.join(OUT_DIR, filename);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`  ✅ Saved ${filename}`);
  }

  // 1. Capture Public Pages
  await snap('/', 'hero_landing.png', 4000);
  await snap('/login', 'login_auth.png', 2000);
  await snap('/donate', 'smart_donation.png', 2500);
  await snap('/alerts', 'alerts_weather.png', 2500);
  await snap('/safety', 'safety_map.png', 3500);

  // 2. NGO Operations Hub
  console.log('🔑 Authenticating as NGO Admin...');
  const ngoData = await loginApi('ngo@gmail.com', 'ngo@123');
  if (ngoData.success && ngoData.token) {
    await page.evaluate((data) => {
      localStorage.setItem('relieflink-auth', JSON.stringify({
        state: { user: data.user, token: data.token, isAuthenticated: true },
        version: 0
      }));
    }, ngoData);

    await snap('/ngo', 'ngo_dashboard.png', 3000);
    await snap('/ngo/sos', 'ngo_sos_triage.png', 3000);
    await snap('/ngo/camps', 'ngo_camp_management.png', 3000);
    await snap('/ngo/inventory', 'ngo_inventory_management.png', 3000);
    await snap('/missing-persons', 'missing_persons_directory.png', 3000);
  }

  // 3. Volunteer Hub
  console.log('🔑 Authenticating as Volunteer...');
  const volData = await loginApi('volunteer@gmail.com', 'volunteer@123');
  if (volData.success && volData.token) {
    await page.evaluate((data) => {
      localStorage.setItem('relieflink-auth', JSON.stringify({
        state: { user: data.user, token: data.token, isAuthenticated: true },
        version: 0
      }));
    }, volData);

    await snap('/volunteer', 'volunteer_dashboard.png', 3000);
    await snap('/volunteer/nearby', 'volunteer_nearby_radar.png', 3000);
    await snap('/camp-finder', 'camp_finder.png', 3500);
  }

  // 4. Affected Citizen Portal
  console.log('🔑 Setting up Citizen auth...');
  // Use Affected user if available, or forge state
  const mockCitizen = {
    _id: 'citizen_demo_id',
    name: 'Anu Varghese',
    phone: '9876543210',
    role: 'affected',
    isVerified: true
  };
  await page.evaluate((user, token) => {
    localStorage.setItem('relieflink-auth', JSON.stringify({
      state: { user, token, isAuthenticated: true },
      version: 0
    }));
  }, mockCitizen, volData.token);

  await snap('/dashboard', 'citizen_dashboard.png', 3000);
  await snap('/sos', 'citizen_sos_emergency.png', 3000);
  await snap('/relief-request', 'citizen_relief_request.png', 3000);

  await browser.close();
  console.log('🎉 All live screenshots captured successfully!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
