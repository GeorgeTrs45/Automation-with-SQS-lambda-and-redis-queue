const supabase = require('../db/supabase');

// get product by product_id
const fetchProductById = async (product_id) => {
  if (!product_id) throw new Error('product_id is required');
  const { data, error } = await supabase
    .from('products_scrapped')
    .select('*')
    .eq('product_id', product_id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// update feedback
const updateFeedbackDb = async (product_id, feedback) => {
  try {
    if (!feedback) throw new Error('feedback is required');
    const { error } = await supabase.from('products_scrapped').update({ feedback }).eq('product_id', product_id);
    if (error) {
      console.error(`[updateFeedbackDb] Error updating feedback for product_id ${product_id}:`, error.message);
      throw new Error(error.message);
    }
    return { message: 'Feedback updated successfully.' };
  } catch (err) {
    console.error(`[updateFeedbackDb] error in ${product_id} :`, err.message);
    throw err;
  }
};

// remove vendor
const removeVendorDb = async (product_id, vendor_name) => {
  try {
    if (!vendor_name) throw new Error('vendor_name is required');
    const product = await fetchProductById(product_id);
    const newPreferredVendors = (product.preferred_vendors || []).filter(v => v !== vendor_name);
    const newVendorDetails = (product.vendor_details || []).filter(v => v.vendor !== vendor_name);
    const { error } = await supabase.from('products_scrapped').update({ preferred_vendors: newPreferredVendors, vendor_details: newVendorDetails }).eq('product_id', product_id);
    if (error) {
      console.error(`[removeVendorDb] Error removing vendor '${vendor_name}' for product_id ${product_id}:`, error.message);
      throw new Error(error.message);
    }
    return { message: 'Vendor removed successfully.' };
  } catch (err) {
    console.error(`[removeVendorDb] error in ${product_id}:`, err.message);
    throw err;
  }
};

// Generic fetch for any table (e.g., cookies tables)
const fetchAllFromTable = async (tableName) => {
  if (!tableName) throw new Error('tableName is required');
  const { data, error } = await supabase.from(`${tableName}_cookies`).select('*').order('id', { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  if (!data || !data[0]) return {}; 
  return data[0];
};

module.exports = { fetchProductById, updateFeedbackDb, removeVendorDb, fetchAllFromTable }; 