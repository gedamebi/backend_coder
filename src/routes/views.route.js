import { Router } from 'express';
import ProductManager from '../Class/productManager.js';
import { __dirname } from '../utils.js';
import { ProductModel } from "../model/product.model.js";
import { CartsModel } from "../model/carts.model.js";


const router = Router();
const productManager = new ProductManager(__dirname + '/data/productos.json');

router.get('/', async (req, res) => {
    //await productManager.verificarFileJson();
    //const products = await productManager.getProductList();
    const page = parseInt(req.query.page, 10) || 1;

    const sort = req.query.sort;
    const sortManager = {
        'asc': 1,
        'dsc': -1
    };

    try {
        const options = {
            page: page,
            limit: 6,
            ...(sort && { sort: { price: sortManager[sort]} }),
            customLabels: { docs: 'payload' }
        };
        const products = await ProductModel.paginate({}, options);
        res.render('home', { products, titulo : "Home" });
    } catch (error) {
        res.status(500).send({error: error.message, status: 'error'});
    }
});

router.get('/realtimeproducts', async (req, res) => {
    await productManager.verificarFileJson();
    const products = await productManager.getProductList();
    res.render('realtimeProducts', { products, titulo : "RealTime Products" });
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    const carts = await CartsModel.findById(cid).populate('products.product');
    res.render('carts', { carts, titulo : "Carts" });
});

export default router;