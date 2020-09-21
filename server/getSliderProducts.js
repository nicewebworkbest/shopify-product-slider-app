const { getSliderProductsByShop, addSliderProduct } = require('./src/service/slider_products.service');

const getSliderProducts = async (shop) => {
    return await getSliderProductsByShop(shop);
};
  
module.exports = getSliderProducts;