import { Router } from 'express';
import { getAlbum, getAllAlbums } from '../controller/album.controller.js';

const router = Router();

router.get("/", getAllAlbums);
router.get("/:albumId", getAlbum);

export default router;