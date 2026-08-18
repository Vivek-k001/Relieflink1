const DisasterAlert = require('../models/DisasterAlert');
const Notification = require('../models/Notification');
const User = require('../models/User');
const axios = require('axios');

// @desc  Create disaster alert (admin/ngo)
// @route POST /api/alerts
const createAlert = async (req, res) => {
  try {
    const { title, message, disasterType, severity, affectedAreas, broadcastZone, radius, expiresAt, actionRequired, evacuationRoute } = req.body;

    const alert = await DisasterAlert.create({
      issuedBy: req.user._id,
      title, message, disasterType, severity,
      affectedAreas: affectedAreas || [],
      broadcastZone,
      radius,
      expiresAt,
      actionRequired,
      evacuationRoute,
    });

    // Broadcast to all connected users via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('new_alert', {
        alertId: alert._id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        disasterType: alert.disasterType,
        affectedAreas: alert.affectedAreas,
      });
    }

    // Create notifications for all users (bulk)
    const users = await User.find({ isActive: true }, '_id');
    const notifications = users.map((u) => ({
      userId: u._id,
      title: `⚠️ ${alert.title}`,
      message: alert.message,
      type: 'alert',
      relatedId: alert._id,
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get active alerts
// @route GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const totalCount = await DisasterAlert.countDocuments();
    if (totalCount === 0) {
      await DisasterAlert.insertMany([
        {
          title: '🚨 RED ALERT: Severe Flood Warning in Low-Lying Coastal & Riverine Districts',
          message: 'Heavy continuous rainfall has led to rising water levels in rivers and coastal inundation. Water levels are expected to cross danger marks.',
          disasterType: 'flood',
          severity: 'emergency',
          affectedAreas: ['Kuttanad', 'Ernakulam Coastal', 'Alappuzha', 'Thrissur'],
          broadcastZone: 'Statewide Coastal Belt',
          actionRequired: 'Immediate evacuation to designated relief camps on higher ground. Stock clean drinking water and medical supplies.',
          isActive: true,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
        {
          title: '⚠️ CYCLONE ADVISORY: Deep Depression in Bay of Bengal',
          message: 'Cyclonic storm gathering strength with expected wind speeds of 85-100 km/h. Heavy to very heavy rainfall expected across coastal districts.',
          disasterType: 'cyclone',
          severity: 'critical',
          affectedAreas: ['Coastal Odisha', 'Gangetic West Bengal', 'Northern Andhra'],
          broadcastZone: 'East Coast Zone',
          actionRequired: 'Fishermen advised not to venture into sea. Secure loose structures and stay indoors.',
          isActive: true,
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        },
        {
          title: '⛰️ LANDSLIDE HAZARD: Torrential Rain Advisory for Western Ghats',
          message: 'Saturated soil conditions due to relentless downpours have significantly increased landslide risk along mountain slopes.',
          disasterType: 'landslide',
          severity: 'warning',
          affectedAreas: ['Wayanad', 'Idukki', 'Shimoga Ghats'],
          broadcastZone: 'High Altitude Zones',
          actionRequired: 'Avoid non-essential travel on mountain highways between 7 PM and 6 AM.',
          isActive: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ]);
    }

    const { active, disasterType } = req.query;
    let query = {};
    if (active === 'true') {
      query.isActive = true;
      query.$or = [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }];
    }
    if (disasterType) query.disasterType = disasterType;

    const alerts = await DisasterAlert.find(query)
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single alert
// @route GET /api/alerts/:id
const getAlertById = async (req, res) => {
  try {
    const alert = await DisasterAlert.findById(req.params.id).populate('issuedBy', 'name role');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Deactivate alert
// @route PUT /api/alerts/:id/deactivate
const deactivateAlert = async (req, res) => {
  try {
    const alert = await DisasterAlert.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    const io = req.app.get('io');
    if (io) io.emit('alert_deactivated', { alertId: alert._id });
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Proxy IMD Website
// @route GET /api/alerts/imd-proxy
const getImdProxy = async (req, res) => {
  try {
    const { id } = req.query;
    const response = await axios.get(`https://mausam.imd.gov.in/imd_latest/contents/districtwisewarnings_mc.php?id=${id || 4}`);
    let html = response.data;
    
    // Fetch the shapefile server-side to bypass browser CORS policies for AJAX
    const shapefileRes = await axios.get('https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/mc_thiruvananthapuram.json');
    const shapefileJson = JSON.stringify(shapefileRes.data);

    // Replace the failing AJAX call with our fetched data inline asynchronously!
    // Using setTimeout ensures AmCharts.parseGeoJSON is defined before it runs.
    html = html.replace(
      'jQuery.getJSON("district_shapefiles/mc_thiruvananthapuram.json", function(data) {', 
      `setTimeout(function() { var data = ${shapefileJson};`
    );

    // Expose the map object globally so we can control it
    html = html.replace('var map = AmCharts.makeChart("chartdiv"', 'window.map = AmCharts.makeChart("chartdiv"');

    // Zoom out the map by intercepting the amCharts zoomLevel config
    html = html.replace('"zoomLevel": 0.7', '"zoomLevel": 0.35');

    // Inject <base> and CSS to crop the page down to just the map container
    const injectedCSS = `
      <base href="https://mausam.imd.gov.in/imd_latest/contents/">
      <style>
        /* Hide Headers, Footers, and Sidebars */
        header, #header, #second_logo, footer, #footer, #content, .other, #current {
          display: none !important;
        }
        /* Reset margins and let the map take full space */
        body, html { margin: 0; padding: 0; background: white; overflow: hidden; width: 100%; height: 100%; }
        #pageheight, #pagewrap { width: 100% !important; height: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; background: white; }
        #columns { width: 100% !important; margin: 0 !important; float: none !important; display: block !important; }
        #middle { width: 100% !important; margin: 0 !important; padding: 0 !important; float: none !important; display: block !important; position: relative; }
        .middle_content { border: none !important; padding: 10px !important; width: 100% !important; display: block !important; margin: 0 auto; box-sizing: border-box; }
        
        /* Center Title */
        h3 { text-align: center !important; font-family: sans-serif; margin-top: 10px; margin-bottom: 5px; }
        hr { display: none; }
        
        /* Adjust map height to fit perfectly in our 420px iframe */
        #chartdiv { height: 350px !important; margin-top: -30px; width: 100% !important; }
        /* Clean up amcharts watermark */
        a[title="JavaScript charts"] { display: none !important; }
        
        /* Hide default AmCharts zoom buttons since we inject custom ones */
        .ammap-zoom-control { display: none !important; }
      </style>
    `;
    html = html.replace('<head>', '<head>' + injectedCSS);

    // Inject Custom Modern Zoom Buttons
    const injectedHTML = `
      <div style="position: absolute; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;">
        <button onclick="window.map.zoomIn()" style="width: 40px; height: 40px; border-radius: 8px; border: none; background: #1E293B; color: white; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">+</button>
        <button onclick="window.map.zoomOut()" style="width: 40px; height: 40px; border-radius: 8px; border: none; background: #1E293B; color: white; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">-</button>
      </div>
    `;
    html = html.replace('</body>', injectedHTML + '</body>');
    
    // Fix protocol-less URLs
    html = html.replace(/"\/\/www\.amcharts\.com/g, '"https://www.amcharts.com');
    html = html.replace(/"\/\/cdnjs\.cloudflare\.com/g, '"https://cdnjs.cloudflare.com');

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to proxy IMD website');
  }
};

module.exports = { createAlert, getAlerts, getAlertById, deactivateAlert, getImdProxy };
