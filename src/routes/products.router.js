import { Router } from "express";
import { __dirname, isNumeric, uploader } from '../utils.js';
import ProductManager from '../Class/productManager.js';

const router = Router();

const productManager = new ProductManager(__dirname + '/data/products.json');

router.use((req, res, next) => {
    // Verificamos que exista el archivo Json sino lo inicializamos
    productManager.verificarFileJson();
    next();
})

router.post('/', uploader.array("thumbnails", 10), async (req, res) => {

    const dataProducto = req.body;

    let thumbnails = []
    if (req.files){
        thumbnails = req.files ? req.files.map(file => file.path) : [];
    }
    dataProducto.thumbnails = thumbnails;
      
    // Desestructuro para validar datos
    const { title, description, code, price, stock, category } = dataProducto;
    // Validación de campos obligatorios
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }

    // Valido que los campos sean numericos
    if (!isNumeric(price) || !isNumeric(stock)){
        return res.status(400).json({ error: 'Datos numericos invalidos' });
    }

    try {
        await productManager.addProduct(dataProducto);
        res.status(201).json({ message: 'Producto agregado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;

    // Verifico que si actualizan stock y precio sean numericos
    const { price, stock } = req.body;
    if ((price && !isNumeric(price)) || (stock && !isNumeric(stock))){
        return res.status(400).json({ error: 'Datos numericos invalidos' });
    }

    try {
        const retorno = await productManager.updateProduct(pid, req.body);
        if (retorno){
            res.status(201).json({ resultado: 'Producto modificado correctamente' })
        } else {
            res.status(400).json({ resultado: 'Producto no encontrado' })
        }       
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const retorno = await productManager.deleteProduct(pid);
        if (retorno){
            res.status(201).json({ resultado: 'Producto eliminado correctamente' })
        } else {
            res.status(400).json({ resultado: 'Producto no encontrado' })
        }      
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/', async (req, res) => {
    let productList = await productManager.getProductList();
    
    // Aplicar limitación si se proporciona el parámetro ?limit
    const limit = req.query.limit;
    if (limit) {
        productList = productList.slice(0, parseInt(limit));
    }

    res.status(201).json({ resultado: productList })
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const product = await productManager.getProductById(id);   
    res.status(201).json({ resultado: product })
});

export default router;