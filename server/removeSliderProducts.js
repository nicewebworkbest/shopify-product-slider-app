const { removeProductsFromSlider } = require('./src/service/slider_products.service');

const removeSliderProducts = async (productIds, shop) => {
  return await removeProductsFromSlider(shop, productIds);
};
  
module.exports = removeSliderProducts;