const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SliderProductsSchema = new Schema({
  id: String,
  shop: String,
  productId: String,
  title: String,
  price: String,
  imageSrc: String,
  altText: String
});

module.exports = mongoose.model('SliderProducts', SliderProductsSchema);