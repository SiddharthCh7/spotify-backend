import { Router } from 'express';
import {protectRoute, requireAdmin} from '../middleware/auth.middleware.js';
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong } from '../controller/admin.controller.js';


const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post('/create_song', createSong);
router.delete('/delete_song/:id', deleteSong);

router.post('/create_album', createAlbum);
router.delete('/delete_album/:id', deleteAlbum);

export default router;
