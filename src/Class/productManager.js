import fs from 'node:fs'
import { v4 as uuidv4 } from 'uuid';


class ProductManager {
    
    constructor(path){
        this.path = path;
        this.productList = [];
    }

    async verificarFileJson(){
        if (!fs.existsSync(this.path)) {
            await fs.promises.writeFile(this.path, JSON.stringify({ data: [] }))
        }
    }

    async getProductList(){
        const list = await fs.promises.readFile(this.path,'utf-8')
        this.productList = [...JSON.parse(list).data]
        return [...this.productList]
    }

    async getProductById(id){
        await this.getProductList();
        const productEncontrado = this.productList.find(product => product.id === id);
        if (productEncontrado == undefined){
            return false;
        }
        return productEncontrado;
    }

    async addProduct(product){
        try {
            product.id = uuidv4(); // Generar un ID
            await this.getProductList();
            this.productList.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify({ data: this.productList }))
            return true;
        } catch (error) {
            throw new Error('Error al guardar el producto');
        }
    }

    async updateProduct(id, datosActualizados){
        try {
            await this.getProductList();
            const productIndex = this.productList.findIndex(product => product.id === id);

            if (productIndex === -1) {
                return false;
            }

            const keys = Object.keys(datosActualizados);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = datosActualizados[key];
                this.productList[productIndex][key] = value;
            }

            await fs.promises.writeFile(this.path, JSON.stringify({ data: this.productList }))
            return true;
        } catch (error) {
            throw new Error('Error al actualizar el producto');
        }
    }

    async deleteProduct(id){
        try {
            await this.getProductList();

            const productIndex = this.productList.findIndex(product => product.id === id);
            if (productIndex === -1) {
                return false;
            }

            const productListFiltrado = this.productList.filter(product => product.id !== id);
            this.productList = [...productListFiltrado]

            await fs.promises.writeFile(this.path, JSON.stringify({ data: this.productList }))
            return true;
        } catch (error) {
            throw new Error('Error al eliminar el producto');
        }
    }
}

export default ProductManager