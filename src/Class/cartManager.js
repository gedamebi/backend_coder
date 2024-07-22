import fs from 'node:fs'
import { v4 as uuidv4 } from 'uuid';

export class CartManager {
    constructor(path){
        this.path = path
        this.cartsList = []
    }

    async verificarFileJson(){
        if (!fs.existsSync(this.path)) {
            await fs.promises.writeFile(this.path, JSON.stringify({ data: [] }))
        }
    }

    async getCartList(){
        const list = await fs.promises.readFile(this.path,'utf-8')
        this.cartsList = [...JSON.parse(list).data]
        return [...this.cartsList]
    }

    async addCart(){
        try {
            const cart = {
                id : uuidv4(),
                products : []
            }
            await this.getCartList();
            this.cartsList.push(cart);
            await fs.promises.writeFile(this.path, JSON.stringify({ data: this.cartsList }))
            return cart.id;
        } catch (error) {
            throw new Error('Error al crear el carrito');
        }
    }

    async addProductToCard(id, productId){
        this.cartsList = await this.getCartList();
        try {
            const cartEncontrado = this.cartsList.find(cart => cart.id === id);
            if (cartEncontrado == undefined){
                return false;
            }
            const cardsUpdated = this.cartsList.map((cart)=>{
                if(cart.id !== id) return cart
                
                const indexProd = cart.products.findIndex(prod => prod.product === productId);
                if(indexProd === -1){
                    cart.products.push({ product: productId, quantity: 1 })
                    return cart;
                }
                cart.products[indexProd] = { ...cart.products[indexProd], quantity: cart.products[indexProd].quantity + 1 }
                return cart;   
            })
            this.cartsList = [...cardsUpdated]
            await fs.promises.writeFile(this.path,JSON.stringify({ data: this.cartsList }))
        } catch (error) {
            throw new Error('Error al agregar producto al carrito');
        }
    }

    async getProductsFromCart(id){
        await this.getCartList();
        const productListFiltrado = this.cartsList.find(carts => carts.id === id);
        if (productListFiltrado == undefined){
            return false;
        }
        return productListFiltrado.products;
    }
}

export default CartManager