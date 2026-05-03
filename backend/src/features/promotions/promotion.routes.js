const express = require('express');
const { getAllPromotions, createPromotion, verifyPromoCode, updatePromotion, deletePromotion } = require('./promotion.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllPromotions);
router.post('/verify', verifyPromoCode);

router.use(protect);
router.use(authorize('Admin', 'Staff'));

router.post('/', upload.single('bannerImage'), createPromotion);
router.patch('/:id', upload.single('bannerImage'), updatePromotion);
router.put('/:id', upload.single('bannerImage'), updatePromotion);
router.delete('/:id', deletePromotion);

module.exports = router;
