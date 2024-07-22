import { Router } from "express";
import { __dirname } from '../utils.js';
import CartManager from '../Class/cartManager.js';

const router = Router();

const cartManager = new CartManager(__dirname + '/data/carrito.json');

router.use(async (req, res, next) => {
    await cartManager.verificarFileJson();
    next();
});

router.post('/', async (req, res) => {
    try {
        const id = await cartManager.addCart();
        res.status(201).json({ message: 'Carrito creado correctamente', id: id })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});
 
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.addProductToCard(cid, pid);
        if (cart == false){
            res.status(404).json({ message: 'Carrito no encontrado' })
        } else {
            res.status(201).json({ message: 'Producto agregado al carrito', cart: cart });
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const productsId = await cartManager.getProductsFromCart(cid);  
    if (productsId == false){
        res.status(404).json({ message: "Carrito no encontrado" })
    } else {
        res.status(200).json({ products: productsId })
    }
});

export default router;