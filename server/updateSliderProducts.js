const { updateProductsInSlider } = require('./src/service/slider_products.service');

const updateSliderProducts = async (webhook) => {
  let slider_product_info = {
    id: webhook.payload.admin_graphql_api_id,
    shop: webhook.domain,
    productId: webhook.payload.admin_graphql_api_id,
    title: webhook.payload.title
  }

  try {
    slider_product_info.imageSrc = webhook.payload.images[0].src;
  } catch (e) {
    slider_product_info.imageSrc = "";
  }
  try {
    slider_product_info.altText = webhook.payload.images[0].alt;
  } catch (e) {
    slider_product_info.altText = "";
  }
  try {
    slider_product_info.price = webhook.payload.variants[0].price;
  } catch (e) {
    slider_product_info.price = "";
  }
  updateProductsInSlider(slider_product_info);
      
  return;
};
  
module.exports = updateSliderProducts;