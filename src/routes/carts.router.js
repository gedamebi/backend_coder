import { Router } from "express";
import { __dirname } from '../utils.js';
import { CartsModel } from "../model/carts.model.js";

const router = Router();

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cartFinded = await CartsModel.findById(cid).populate('products.product');

    if (cartFinded == false){
        res.status(404).json({ message: 'Carrito no encontrado' })
    } else {
        res.status(200).json({ products: cartFinded?.products })
    }
});

router.post('/', async (req, res) => {
    try {
        const newCart = await CartsModel.create({
            products: []
        })
        res.status(201).json({ message: 'Carrito creado correctamente', cart: newCart })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body

    const cartFinded = await CartsModel.findById(cid).lean();
    if(cartFinded == false) {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const newCart = {
        ...cartFinded,
        products
    }
    const cartUpdated = await CartsModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Carrito actualizado', cart: cartUpdated})

});
 
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cartFinded = await CartsModel.findById(cid);
        if(cartFinded == false){
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    
        const indexProd = cartFinded.products.findIndex(prod => prod.product.toString() === pid);
        if(indexProd === -1){
            cartFinded.products.push({ product: pid, quantity: 1 })
        } else {
            cartFinded.products[indexProd] = { product: cartFinded.products[indexProd].product, quantity: cartFinded.products[indexProd].quantity + 1 }
        }
        const cartUpdated = await CartsModel.findByIdAndUpdate(cid,cartFinded, {
            new: true,
        }).populate('products.product')
    
        res.status(201).json({ message: 'Producto agregado al carrito', cart: cartUpdated})
        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    const cartFinded = await CartsModel.findById(cid).lean();
    if(cartFinded == false) {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const newCart = {
        ...cartFinded,
        products: []
    }
    const cartUpdated = await CartsModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    })

    res.status(201).json({ message: 'Carrito viciado correctamente', cart: cartUpdated})
});

router.delete('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const cartFinded = await CartsModel.findById(cid).lean();
    if(cartFinded == false) {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const cartFiltered = {
        ...cartFinded,
        products:  cartFinded.products.filter(prod => prod.product.toString() !== pid)
    }

    const cartUpdated = await CartsModel.findByIdAndUpdate(cid,cartFiltered, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Producto eliminado del carrito correctamente', cart: cartUpdated})
});


export default router;