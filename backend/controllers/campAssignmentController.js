const ReliefCamp = require('../models/ReliefCamp');
const CampAssignment = require('../models/CampAssignment');
const SosRequest = require('../models/SosRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc  Get nearby AVAILABLE camps (not full, acceptingRefugees = true)
 *        Used by volunteer when assigning an affected user to a camp.
 * @route GET /api/camps/available?lat=&lng=&radius=50
 */
const getAvailableCamps = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const baseQuery = {
      status: { $in: ['active'] },
      acceptingRefugees: true,
    };

    let camps = [];

    // Try geo-sorted search first (closest first)
    if (lat && lng) {
      try {
        camps = await ReliefCamp.find({
          ...baseQuery,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              $maxDistance: parseFloat(radius) * 1000,
            },
          },
        })
          .populate('managedBy', 'name organizationName phone')
          .limit(10);
      } catch (geoErr) {
        console.warn('Geo query failed, falling back to all available camps:', geoErr.message);
      }
    }

    // Fallback if no geo coords or geo returned nothing
    if (!camps || camps.length === 0) {
      camps = await ReliefCamp.find(baseQuery)
        .populate('managedBy', 'name organizationName phone')
        .limit(10);
    }

    // Attach occupancy % to each camp for UI display
    const campsWithMeta = camps.map((c) => ({
      ...c.toObject(),
      occupancyPercent: c.capacity > 0 ? Math.round((c.currentOccupancy / c.capacity) * 100) : 0,
      availableSlots: c.capacity - c.currentOccupancy,
    }));

    res.json({ success: true, camps: campsWithMeta });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Volunteer assigns an affected user to a specific camp.
 *        - Validates camp is still available (not full)
 *        - Increments camp occupancy
 *        - Creates CampAssignment audit record
 *        - Links assignment to the SOS request
 *        - Notifies the affected user
 * @route POST /api/camps/:campId/assign
 * @body  { sosId, userId }  — the SOS and the affected user being assigned
 */
const assignUserToCamp = async (req, res) => {
  try {
    const { campId } = req.params;
    let { sosId, userId } = req.body;

    if (!sosId) {
      return res.status(400).json({ success: false, message: 'sosId is required' });
    }

    const sos = await SosRequest.findById(sosId);
    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS request not found' });
    }

    if (!userId) {
      userId = sos.userId;
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Could not resolve affected user for this SOS' });
    }

    // 1. Verify camp still has space
    const camp = await ReliefCamp.findById(campId);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (!camp.acceptingRefugees || camp.status === 'full') {
      return res.status(400).json({ success: false, message: `${camp.name} is full or not accepting refugees. Please choose another camp.` });
    }

    // 2. Get affected user info (or fallback to SOS userName/phone)
    let affectedUser = await User.findById(userId).select('name phone');
    const affectedUserName = affectedUser?.name || sos.userName || 'Affected Person';
    const affectedUserPhone = affectedUser?.phone || sos.userPhone || '';

    // 3. Get volunteer (the one making the request)
    const volunteer = await User.findById(req.user._id).select('name phone');

    // 4. Increment occupancy
    camp.currentOccupancy += 1;
    if (camp.currentOccupancy >= camp.capacity) {
      camp.status = 'full';
      camp.acceptingRefugees = false;
    }
    await camp.save();

    // 5. Create audit record
    const assignment = await CampAssignment.create({
      userId: affectedUser?._id || userId,
      userName: affectedUserName,
      userPhone: affectedUserPhone,
      assignedBy: req.user._id,
      assignedByName: volunteer?.name,
      campId: camp._id,
      campName: camp.name,
      relatedSos: sosId,
    });

    // 6. Link camp to the SOS request
    await SosRequest.findByIdAndUpdate(sosId, {
      assignedCamp: camp._id,
      campAssignedAt: new Date(),
      status: 'in_progress', // volunteer picked up user and heading to camp
    });

    // 7. Notify the affected user
    if (affectedUser?._id || userId) {
      await Notification.create({
        userId: affectedUser?._id || userId,
        title: '🏕️ You have been assigned to a Relief Camp',
        message: `${volunteer?.name || 'Your volunteer'} has assigned you to ${camp.name}. Address: ${camp.address}. Contact: ${camp.contactPhone || 'Available at camp'}.`,
        type: 'sos',
        relatedId: camp._id,
      });
    }

    // 8. Real-time socket notification to affected user
    const io = req.app.get('io');
    if (io) {
      io.to(affectedUser._id.toString()).emit('camp_assigned', {
        campName: camp.name,
        campAddress: camp.address,
        contactPhone: camp.contactPhone,
        assignedByName: volunteer?.name,
      });
    }

    const populatedAssignment = await CampAssignment.findById(assignment._id)
      .populate('userId', 'name phone')
      .populate('assignedBy', 'name phone')
      .populate('campId', 'name address district contactPhone');

    res.status(201).json({
      success: true,
      message: `${affectedUser.name} successfully assigned to ${camp.name}`,
      assignment: populatedAssignment,
      camp: { name: camp.name, address: camp.address, currentOccupancy: camp.currentOccupancy, capacity: camp.capacity },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all assignments for a specific camp (NGO panel view)
 * @route GET /api/camps/:campId/assignments
 */
const getCampAssignments = async (req, res) => {
  try {
    const { campId } = req.params;
    const { status, page = 1, limit = 30 } = req.query;

    // If NGO, verify they manage this camp
    if (req.user.role === 'ngo') {
      const camp = await ReliefCamp.findOne({ _id: campId, managedBy: req.user._id });
      if (!camp) return res.status(403).json({ success: false, message: 'Not authorized to view this camp' });
    }

    let query = { campId };
    if (status) query.status = status;

    const assignments = await CampAssignment.find(query)
      .populate('userId', 'name phone district')
      .populate('assignedBy', 'name phone')
      .populate('campId', 'name address')
      .populate('relatedSos', 'disasterType priority description')
      .sort({ assignedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CampAssignment.countDocuments(query);

    res.json({ success: true, total, page: parseInt(page), assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Get all assignments across all camps managed by this NGO
 * @route GET /api/camps/assignments/my
 */
const getAllMyAssignments = async (req, res) => {
  try {
    // Get all camps managed by this NGO/admin
    let campQuery = {};
    if (req.user.role === 'ngo') campQuery.managedBy = req.user._id;

    const myCamps = await ReliefCamp.find(campQuery).select('_id name');
    const campIds = myCamps.map((c) => c._id);

    const { status, page = 1, limit = 50 } = req.query;
    let query = { campId: { $in: campIds } };
    if (status) query.status = status;

    const assignments = await CampAssignment.find(query)
      .populate('userId', 'name phone district')
      .populate('assignedBy', 'name phone')
      .populate('campId', 'name address district')
      .populate('relatedSos', 'disasterType priority description')
      .sort({ assignedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CampAssignment.countDocuments(query);

    res.json({ success: true, total, page: parseInt(page), assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Update assignment status (e.g., mark as 'arrived' or 'checked_out')
 * @route PUT /api/camps/assignments/:assignmentId/status
 */
const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes } = req.body;

    const assignment = await CampAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    assignment.status = status;
    if (notes) assignment.notes = notes;
    if (status === 'arrived') assignment.arrivedAt = new Date();
    if (status === 'checked_out') {
      assignment.checkedOutAt = new Date();
      // Decrement occupancy when user leaves camp
      await ReliefCamp.findByIdAndUpdate(assignment.campId, {
        $inc: { currentOccupancy: -1 },
        status: 'active',
        acceptingRefugees: true,
      });
    }
    await assignment.save();

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAvailableCamps, assignUserToCamp, getCampAssignments, getAllMyAssignments, updateAssignmentStatus };
