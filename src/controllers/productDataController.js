const { fetchProductById, updateFeedbackDb, removeVendorDb } = require('../models/productModel');

const getProductById = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const data = await fetchProductById(product_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { feedback } = req.body;
    const result = await updateFeedbackDb(product_id, feedback);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const removeVendor = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { vendor_name } = req.body;
    const result = await removeVendorDb(product_id, vendor_name);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getProductById,
  updateFeedback,
  removeVendor
}; 