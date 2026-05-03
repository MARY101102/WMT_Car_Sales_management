const express = require('express');
const { getCars, getCar, createCar, updateCar, deleteCar } = require('./car.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCar);

// Protected routes (Admin/Staff only)
router.use(protect);
router.use(authorize('Admin', 'Staff'));

router.post(
  '/', 
  upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), 
  createCar
);

router.put(
  '/:id', 
  upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), 
  updateCar
);

router.patch(
  '/:id', 
  upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), 
  updateCar
);

router.delete('/:id', deleteCar);

module.exports = router;
