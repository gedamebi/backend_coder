import express from 'express';
import handlebars from 'express-handlebars';
import moment from 'moment';
import fs from 'node:fs'
import { __dirname, isNumeric } from './utils.js';

import { Server } from 'socket.io';

import ProductsRoute from './routes/products.router.js';
import CartsRoute from './routes/carts.router.js';
import ViewRouters from './routes/views.route.js';


import ProductManager from './Class/productManager.js';
const productManager = new ProductManager(__dirname + '/data/productos.json');


const app = express();
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine','handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/',ViewRouters);
app.use('/api/products/', ProductsRoute);
app.use('/api/carts/', CartsRoute);


const conversacion = [];
const usuarios = [];

const httpServer = app.listen(8080, () => {
    console.log("Servidor iniciado en puerto 8080");
})

export const socketServer = new Server(httpServer);

socketServer.on('connection', (socket) => {
    
    socket.on('addProduct', async ({product, thumbnails}) => {
        let validacionResult = true;
        const { title, description, code, price, stock, category } = product;
        if (!title || !description || !code || !price || !stock || !category) {
            validacionResult = false;
        }

        if (!isNumeric(price) || !isNumeric(stock)){
            validacionResult = false
        }

        if (validacionResult){
            const thumbnailsURLs = [];
            if (thumbnails.length > 0){
                thumbnails.forEach(fileData => {
                    const filePath = __dirname + '/public/img/' + fileData.name;
                    thumbnailsURLs.push('img/' + fileData.name);
                    fs.writeFile(filePath, fileData.data, 'base64', (err) => {
                        if (err) {
                            console.error('Error al guardar el archivo:', err);
                        }
                    });
                });
            } else {
                thumbnailsURLs.push('img/sin_imagen.png');
            }
            
            product.thumbnails = thumbnailsURLs;
            const result = await productManager.addProduct(product);
            socketServer.emit('updateProducts', { 
                products : await productManager.getProductList(),
                result : result,
                metodo: 'agregar'
            });
        } else {
            socketServer.emit('updateProducts', { 
                products : await productManager.getProductList(),
                result : false,
                metodo: 'agregar'
            });
        }
        
    });

    socket.on('updateProduct', async ({id ,product}) => {
        const result = await productManager.updateProduct(id, product);
        socketServer.emit('updateProducts', { 
            products : await productManager.getProductList(),
            result : result,
            metodo: 'editar'
        });
    });

    socket.on('deleteProduct', async (productId) => {
        const result = await productManager.deleteProduct(productId);
        socketServer.emit('updateProducts', {
            products : await productManager.getProductList(),
            result : result,
            metodo: 'eliminar'
        });
    });





    
    socket.on('mensaje',(data) => {
        const fechaHoraFormateada = moment().format('HH:mm DD/MM/YY');
        data.date = fechaHoraFormateada;
        conversacion.push(data);
        socketServer.emit('conversacion', conversacion);
    })
    
    socket.on('nuevoUsuario', (nuevoUsuario) => {
        usuarios.push(nuevoUsuario)
        socket.emit('conversacion', conversacion);
        socketServer.emit('conectados',usuarios);
    })

    socket.on('desconectarUsuario', (user) => {
        const indiceAEliminar = usuarios.findIndex(usuario => usuario.user === user.user);
        if (indiceAEliminar !== -1) {
            usuarios.splice(indiceAEliminar, 1);
        }
    });
});