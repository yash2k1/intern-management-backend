import Certificate from '../models/certificate.models.js';
import User from '../models/user.models.js';
import Intern from '../models/Intern.models.js'; 

// Create Certificate - Only MENTORs allowed
export const createCertificate = async (req, res) => {
  try {
    const { internId, fileUrl } = req.body;
    const issuer = await User.findById(req.user.userId);

    if (!issuer || issuer.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can issue certificates' });
    }

    // Optional: Validate intern exists
    const internExists = await Intern.findById(internId);
    if (!internExists) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const certificate = new Certificate({
      internId,
      fileUrl,
      issuedBy: issuer._id,
    });

    await certificate.save();
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
      .populate('internId', 'fullName email') // adjust fields if needed
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

    await certificate.remove();
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
