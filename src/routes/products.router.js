import { Router } from "express";
import { __dirname, isNumeric, uploader } from '../utils.js';
import { ProductModel } from "../model/product.model.js";


const router = Router();

router.post('/', uploader.array("thumbnails", 10), async (req, res) => {

    const dataProducto = req.body;
    let thumbnails = []
    if (req.files){
        thumbnails = req.files ? req.files.map(file => 'img/' + file.filename) : [];
    }

    const { title, description, code, price, stock, category } = dataProducto;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }

    if (!isNumeric(price) || !isNumeric(stock)){
        return res.status(400).json({ error: 'Datos numericos invalidos' });
    }

    try {
        await ProductModel.create({
            title, 
            description, 
            code, 
            price, 
            stock, 
            category, 
            thumbnails
        })
        res.status(201).json({ message: 'Producto agregado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:pid', async (req, res) => {

    const { pid } = req.params;
    const productReq = req.body
    const { price, stock } = productReq;
    if ((price && !isNumeric(price)) || (stock && !isNumeric(stock))){
        return res.status(400).json({ error: 'Datos numericos invalidos' });
    }

    try {
        const productUpdated = await ProductModel.findByIdAndUpdate(pid, {
            ...productReq
          }, { new: true });

        res.status(200).json({ resultado: 'Producto modificado correctamente', payload: productUpdated })     
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const retorno = await ProductModel.findByIdAndDelete(pid);
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
    const { limit = 10, page = 1, sort = '', query } = req.query;

    const filter = {};
    if (query) {
        try {
            Object.assign(filter, JSON.parse(query));
        } catch (e) {
            return res.status(400).send('El parámetro de consulta "query" no es válido.');
        }
    }

    const sortManager = {
        'asc': 1,
        'dsc': -1
    }

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            ...(sort && { sort: { price: sortManager[sort]} }),
            customLabels: { docs: 'payload' }
        };
        const resultado = await ProductModel.paginate(filter, options);
        res.status(200).json({resultado, status: 'success'});
    } catch (error) {
        res.status(500).send({error: error.message, status: 'error'});
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;  
    const product = await ProductModel.findById(pid); 
    if (product == false){
        res.status(404).json({ message: "Producto no encontrado" });
    } else {
        res.status(200).json({ resultado: product });
    }
});

export default router;