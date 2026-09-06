const MissingPerson = require('../models/MissingPerson');

// @desc    Get all missing persons (with search & status filtering)
// @route   GET /api/missing-persons
// @access  Public / Authenticated
exports.getMissingPersons = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && ['missing', 'found', 'reunited'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastSeenLocation: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    const missingPersons = await MissingPerson.find(query)
      .populate('campId', 'name location address')
      .populate('reportedBy', 'name phone role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: missingPersons.length,
      missingPersons,
    });
  } catch (error) {
    console.error('Error fetching missing persons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a missing person report
// @route   POST /api/missing-persons
// @access  Private
exports.createMissingPerson = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      photoUrl,
      lastSeenLocation,
      lastSeenDate,
      description,
      contactName,
      contactPhone,
      status,
      campId,
    } = req.body;

    const missingPerson = await MissingPerson.create({
      name,
      age,
      gender,
      photoUrl,
      lastSeenLocation,
      lastSeenDate,
      description,
      contactName,
      contactPhone,
      status: status || 'missing',
      campId: campId || null,
      reportedBy: req.user.id,
    });

    const populated = await MissingPerson.findById(missingPerson._id)
      .populate('campId', 'name location address')
      .populate('reportedBy', 'name phone role');

    // Notify via Socket.io if app io instance is available
    const io = req.app.get('io');
    if (io) {
      io.emit('new_missing_person', populated);
    }

    res.status(201).json({
      success: true,
      message: 'Missing person report created successfully',
      missingPerson: populated,
    });
  } catch (error) {
    console.error('Error creating missing person report:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update missing person status or camp
// @route   PUT /api/missing-persons/:id
// @access  Private
exports.updateMissingPersonStatus = async (req, res) => {
  try {
    const { status, campId, description, photoUrl } = req.body;
    let missingPerson = await MissingPerson.findById(req.params.id);

    if (!missingPerson) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) missingPerson.status = status;
    if (campId !== undefined) missingPerson.campId = campId || null;
    if (description !== undefined) missingPerson.description = description;
    if (photoUrl !== undefined) missingPerson.photoUrl = photoUrl;

    await missingPerson.save();

    const updated = await MissingPerson.findById(missingPerson._id)
      .populate('campId', 'name location address')
      .populate('reportedBy', 'name phone role');

    const io = req.app.get('io');
    if (io) {
      io.emit('missing_person_updated', updated);
    }

    res.status(200).json({
      success: true,
      message: 'Missing person status updated successfully',
      missingPerson: updated,
    });
  } catch (error) {
    console.error('Error updating missing person status:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a missing person report
// @route   DELETE /api/missing-persons/:id
// @access  Private (Reporter or Admin)
exports.deleteMissingPerson = async (req, res) => {
  try {
    const missingPerson = await MissingPerson.findById(req.params.id);

    if (!missingPerson) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (missingPerson.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await missingPerson.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Missing person report removed',
    });
  } catch (error) {
    console.error('Error deleting missing person report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
