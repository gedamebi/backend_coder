import express from 'express';
import { __dirname } from './utils.js';
import ProductsRoute from './routes/products.router.js';
import CartsRoute from './routes/carts.router.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/api/products/', ProductsRoute);
app.use('/api/carts/', CartsRoute);


app.listen(8080, () => {
    console.log("Servidor iniciado en puerto 8080");
})