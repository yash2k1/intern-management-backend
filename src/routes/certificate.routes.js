import express from 'express';
import upload from '../middleware/upload.js'; // your multer setup
import {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  deleteCertificate,
} from '../controller/certificate.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const certificateRoutes = express.Router();

// Create certificate (only mentors can upload)
certificateRoutes.post(
  '/',
  verifyToken,
  upload.single('file'), // Expecting a single file under field 'file'
  createCertificate
);

// Get all certificates (optionally filter by internId or issuedBy)
certificateRoutes.get('/', verifyToken, getAllCertificates);

// Get certificate by ID
certificateRoutes.get('/:id', verifyToken, getCertificateById);

// Delete certificate (only HR or issuing mentor)
certificateRoutes.delete('/:id', verifyToken, deleteCertificate);

export default certificateRoutes;
