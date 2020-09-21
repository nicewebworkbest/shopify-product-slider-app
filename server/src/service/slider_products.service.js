const SliderProducts = require('../models/slider_products');

const getSliderProductsByShop = async (shop) => { 
  const data = await SliderProducts.find({shop: shop}); 
  return data; 
};

const addSliderProduct = async (product) => { 
  var query = {productId: product.productId},
    update = product,
    options = {upsert: true, new: true, setDefaultsOnInsert: true};
  
  await SliderProducts.findOneAndUpdate(query, update, options);
  return;
};

const removeProductsFromSlider = async (shop, productIds) => {
  await SliderProducts.deleteMany({ shop: { $eq: shop }, id: { $in: productIds } }); 
};

const updateProductsInSlider = async (product) => {
  await SliderProducts.updateOne({ shop: { $eq: product.shop }, id: { $eq: product.id } }, product); 
};

module.exports = { getSliderProductsByShop, addSliderProduct, removeProductsFromSlider, updateProductsInSlider };