const express = require('express');
const sparePartsController = require('./spareParts.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(sparePartsController.getAllSpareParts)
  .post(protect, authorize('Admin', 'Staff'), sparePartsController.createSparePart);

router.route('/:idOrSlug')
  .get(sparePartsController.getSparePart)
  .put(protect, authorize('Admin', 'Staff'), sparePartsController.updateSparePart)
  .delete(protect, authorize('Admin', 'Staff'), sparePartsController.deleteSparePart);

module.exports = router;
