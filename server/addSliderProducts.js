const { addSliderProduct } = require('./src/service/slider_products.service');

const addSliderProducts = async (ctx, accessToken, shop) => {
    const query = JSON.stringify({
      query: `query getProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              title
              handle
              id
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                    id
                  }
                }
              }
            }
          }
        }`,
      variables: {
          "ids": ctx.request.body
      }

    });

    const response = await fetch(`https://${shop}/admin/api/2019-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-Shopify-Access-Token": accessToken,
      },
      body: query
    });
  
    const responseJson = await response.json();

    responseJson.data.nodes.forEach(item => {
      let slider_product_info = {
        id: item.id,
        shop: shop,
        productId: item.id,
        title: item.title
      }
      try {
        slider_product_info.imageSrc = item.images.edges[0].node.originalSrc;
      } catch (e) {
        slider_product_info.imageSrc = "";
      }
      try {
        slider_product_info.altText = item.images.edges[0].node.altText;
      } catch (e) {
        slider_product_info.altText = "";
      }
      try {
        slider_product_info.price = item.variants.edges[0].node.price;
      } catch (e) {
        slider_product_info.price = "";
      }
      addSliderProduct(slider_product_info);
    });
      
    return;
};
  
module.exports = addSliderProducts;