import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
    res.render('saludo', {name : 'German'});
});

export default router;