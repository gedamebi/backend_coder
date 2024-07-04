import { Router } from "express";
import { __dirname, isNumeric, uploader } from '../utils.js';
import CartManager from '../Class/cartManager.js';

const router = Router();

const cartManager = new CartManager(__dirname + '/data/carrito.json');

router.use((req, res, next) => {
    // Verificamos que exista el archivo Json sino lo inicializamos
    cartManager.verificarFileJson();
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

//La ruta POST  /:cid/product/:pid deberá agregar el producto al arreglo “products” del carrito seleccionado, 
//agregándose como un objeto bajo el siguiente formato:
// -- product: SÓLO DEBE CONTENER EL ID DEL PRODUCTO (Es crucial que no agregues el producto completo)
// -- quantity: debe contener el número de ejemplares de dicho producto. El producto, de momento, se agregará de uno en uno.
// Además, si un producto ya existente intenta agregarse al producto, incrementar el campo quantity de dicho producto. 
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.addProductToCard(cid, pid);
        res.status(201).json({ message: 'Producto agregado al carrito', cart: cart });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});


// La ruta GET /:cid deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados.
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const productsId = await cartManager.getProductsFromCart(cid);  

    res.status(200).json({ products: productsId })
});

export default router;