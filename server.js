require('isomorphic-fetch');
const dotenv = require('dotenv');
dotenv.config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const initDB = require('./server/src/database'); 
const addSliderProducts = require('./server/addSliderProducts');
const getSliderProducts = require('./server/getSliderProducts');
const removeSliderProducts = require('./server/removeSliderProducts');
const updateSliderProducts = require('./server/updateSliderProducts');
const fs = require("fs");
const path = require("path");
    
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  HOST,
  PROXY_SUB_PATH
} = process.env;

app.prepare().then(() => {

  initDB();
  
  const server = new Koa();
  const router = new Router();
  server.use(session({ sameSite: 'none', secure: true }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(bodyParser());  

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'write_products', 'read_script_tags', 'write_script_tags'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
        });

        const productUpdateHookRegistration = await registerWebhook({
          address: `${HOST}/webhooks/products/update`,
          topic: 'PRODUCTS_UPDATE',
          accessToken,
          shop,
          apiVersion: ApiVersion.July20
        });

        if (productUpdateHookRegistration.success) {
          console.log('Successfully registered product update webhook!');
        } else {
          console.log('Failed to register product update webhook', productUpdateHookRegistration.result);
        }

        const productDeleteHookRegistration = await registerWebhook({
          address: `${HOST}/webhooks/products/delete`,
          topic: 'PRODUCTS_DELETE',
          accessToken,
          shop,
          apiVersion: ApiVersion.July20
        });

        if (productDeleteHookRegistration.success) {
          console.log('Successfully registered product delete webhook!');
        } else {
          console.log('Failed to register product delete webhook', productDeleteHookRegistration.result);
        }

        // Add javascript file to store
        await fetch(`https://${shop}/admin/api/${ApiVersion.July20}/script_tags.json`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            "script_tag": {
              "event": "onload",
              "src": `https://${shop}/apps/${PROXY_SUB_PATH}/assets/js/product-slider.js`
            }
          })
        })
        
        ctx.redirect('/');
      }
    })
  );

  const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

  router.post('/webhooks/products/update', webhook, (ctx) => {
    updateSliderProducts(ctx.state.webhook);
  });

  router.post('/webhooks/products/delete', webhook, (ctx) => {
    removeSliderProducts(['gid://shopify/Product/'+ctx.state.webhook.payload.id], ctx.state.webhook.domain);
  });

  server.use(graphQLProxy({ version: ApiVersion.July20 }));

  router.get('/get-slider-products', verifyRequest(), async (ctx) => {
    const { shop, accessToken } = ctx.session;
    ctx.body = await getSliderProducts(shop);
  });

  router.get('/assets/js/product-slider.js', async (ctx) => {
    const pairs = ctx.request.querystring.split('&');
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    const param = JSON.parse(JSON.stringify(result));
   
    try {
      const data = await fs.readFileSync(path.join(__dirname, ctx.request.path), 'utf8');
      let jsData = "";
      jsData += `var hostUrl = \"https://${param.shop}${param.path_prefix};\";`;

      const sliderData = await getSliderProducts(param.shop);
      
      ctx.body = jsData + "var sliderData = " + JSON.stringify(sliderData) + ";" + data;
      ctx.res.statusCode = 200;
    } catch (err) {
      console.error(err);
      ctx.res.statusCode = 404;
    }
  });

  router.get('/assets/(.*)', async (ctx) => {
    try {
      ctx.body = await fs.readFileSync(path.join(__dirname, ctx.request.path), 'utf8');
      ctx.res.statusCode = 200;
    } catch (err) {
      console.error(err);
      ctx.res.statusCode = 404;
    }
  });

  router.get('/(.*)', verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  router.post('/add-slider-products', verifyRequest(), async (ctx) => {
    const { shop, accessToken } = ctx.session;
    await addSliderProducts(ctx, accessToken, shop);
    ctx.res.statusCode = 200;
  });

  router.delete('/remove-slider-products', verifyRequest(), async (ctx) => {
    const { shop, accessToken } = ctx.session;
    await removeSliderProducts(ctx.request.body, shop);
    ctx.res.statusCode = 200;
  });

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});