import fs from 'node:fs'
import { v4 as uuidv4 } from 'uuid';

export class CartManager {
    constructor(path){
        this.path = path
        this.cartsList = []
    }

    // Funcio para verificar que exista el archivo JSON si no existe lo genero inciamente vacio
    async verificarFileJson(){
        if (!fs.existsSync(this.path)) {
            await fs.promises.writeFile(this.path, JSON.stringify({ data: [] }))
            console.log('Archivo creado.');
        }
    }

    // Obtengo la lista de todos los carritos
    async getCartList(){
        const list = await fs.promises.readFile(this.path,'utf-8')
        this.cartsList = [...JSON.parse(list).data]
        return [...this.cartsList]
    }

    // Creo un carrito con ID autogenerado y con productos inicialmente vacio
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

    // Agrego un producto al carrito
    // Si ya existe produco agregado incremento en 1 el quantity
    async addProductToCard(id, productId){
        this.cartsList = await this.getCartList();
        try {
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

    // Devuelvo los productos que tiene un Carrito con ID especifico
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