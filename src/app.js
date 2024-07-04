import express from 'express';
import { __dirname } from './utils.js';
import ProductsRoute from './routes/productos.router.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/api/products/', ProductsRoute);


app.listen(8080, () => {
    console.log("Servidor iniciado en puerto 8080");
})