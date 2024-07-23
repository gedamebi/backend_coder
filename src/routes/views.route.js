import { Router } from 'express';
import ProductManager from '../Class/productManager.js';
import { __dirname } from '../utils.js';

const router = Router();
const productManager = new ProductManager(__dirname + '/data/productos.json');

router.get('/', async (req, res) => {
    await productManager.verificarFileJson();
    const products = await productManager.getProductList();
    res.render('home', { products, titulo : "Home" });
});

router.get('/realtimeproducts', async (req, res) => {
    await productManager.verificarFileJson();
    const products = await productManager.getProductList();
    res.render('realtimeProducts', { products, titulo : "RealTime Products" });
});

export default router;