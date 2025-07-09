import Certificate from '../models/certificate.models.js';
import User from '../models/user.models.js';
import Intern from '../models/Intern.models.js';

// Upload Certificate File and Create Certificate Document
export const createCertificate = async (req, res) => {
  try {
    const { internId } = req.body;
    const issuer = await User.findById(req.user.userId);

    if (!issuer || issuer.role !== 'HR') {
      return res.status(403).json({ message: 'Only HR can issue certificates' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No certificate file uploaded' });
    }

    const existing = await Certificate.findOne({ internId });
    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this intern' });
    }

    const internExists = await Intern.findById(internId);
    if (!internExists) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const filePath = req.file.path.replace(/^.*uploads[\\/]/, 'uploads/').replace(/\\/g, '/');

    const certificate = new Certificate({
      internId,
      fileUrl: filePath,
      issuedBy: issuer._id,
    });

    await certificate.save();

    // Update Intern status to CERTIFIED
    internExists.status = "CERTIFIED";
    internExists.certificateId = certificate._id; // optionally save reference
    await internExists.save();

    res.status(201).json({ message: 'Certificate issued successfully', certificate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get All Certificates (optionally filter by intern/mentor)
export const getAllCertificates = async (req, res) => {
  try {
    const filters = {};
    if (req.query.internId) filters.internId = req.query.internId;
    if (req.query.issuedBy) filters.issuedBy = req.query.issuedBy;

    const certificates = await Certificate.find(filters)
      .populate('internId', 'fullName email')
      .populate('issuedBy', 'fullName email');

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Certificate by ID
export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('internId', 'fullName email')
      .populate('issuedBy', 'fullName email');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Certificate - only HR or issuing mentor
export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const requester = await User.findById(req.user.userId);

    if (
      !requester ||
      (requester.role !== 'HR' && certificate.issuedBy.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this certificate' });
    }

    // Find the related intern
    const intern = await Intern.findById(certificate.internId);

    await certificate.deleteOne();

    // Update intern status and remove certificateId ref if intern exists
    if (intern) {
      intern.status = "COMPLETED";
      intern.certificateId = null;
      await intern.save();
    }

    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
