import { Router } from 'express';
import { authCallback } from '../controller/auth.controller.js';

const router = Router();

router.get('/', (req, res) => {
    res.send('Auth router is working!')
});

router.post("/callback", authCallback)

export default router;