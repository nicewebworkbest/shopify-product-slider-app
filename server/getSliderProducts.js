const { getSliderProductsByShop, addSliderProduct } = require('./src/service/slider_products.service');

const getSliderProducts = async (ctx, accessToken, shop) => {
    return await getSliderProductsByShop(shop);
};
  
module.exports = getSliderProducts;