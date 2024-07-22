import { Router } from "express";
import { __dirname, isNumeric, uploader } from '../utils.js';
import ProductManager from '../Class/productManager.js';

const router = Router();

const productManager = new ProductManager(__dirname + '/data/productos.json');

router.use(async (req, res, next) => {
    await productManager.verificarFileJson();
    next();
})

router.post('/', uploader.array("thumbnails", 10), async (req, res) => {

    const dataProducto = req.body;
    let thumbnails = []
    if (req.files){
        thumbnails = req.files ? req.files.map(file => 'img/' + file.filename) : [];
    }
    dataProducto.thumbnails = thumbnails;
      
    const { title, description, code, price, stock, category } = dataProducto;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }

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
    const { price, stock } = req.body;
    if ((price && !isNumeric(price)) || (stock && !isNumeric(stock))){
        return res.status(400).json({ error: 'Datos numericos invalidos' });
    }

    try {
        const retorno = await productManager.updateProduct(pid, req.body);
        if (retorno){
            res.status(200).json({ resultado: 'Producto modificado correctamente' })
        } else {
            res.status(404).json({ resultado: 'Producto no encontrado' })
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
            res.status(200).json({ resultado: 'Producto eliminado correctamente' })
        } else {
            res.status(404).json({ resultado: 'Producto no encontrado' })
        }      
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/', async (req, res) => {
    let productList = await productManager.getProductList();  
    const limit = req.query.limit;
    if (limit) {
        productList = productList.slice(0, parseInt(limit));
    }
    res.status(200).json({ resultado: productList })
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);   
    if (product == false){
        res.status(404).json({ message: "Producto no encontrado" });
    } else {
        res.status(200).json({ resultado: product });
    }
    
});

export default router;