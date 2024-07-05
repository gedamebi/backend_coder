import { Router } from "express";
import { __dirname } from '../utils.js';
import CartManager from '../Class/cartManager.js';

const router = Router();

const cartManager = new CartManager(__dirname + '/data/carrito.json');


// Middleware que se ejecuta siempre previamente a la reques solicitada
router.use(async (req, res, next) => {
    // Verificamos que exista el archivo Json sino lo inicializamos
    await cartManager.verificarFileJson();
    next();
});

// Creo una instancia de carrito (inicialmente sin productos)
router.post('/', async (req, res) => {
    try {
        const id = await cartManager.addCart();
        res.status(201).json({ message: 'Carrito creado correctamente', id: id })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});
 
// Agrego productos al carrito
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


// La ruta GET /:cid deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados.
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