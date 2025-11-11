import { Router } from "express";
import { searchMedia } from "../controller/search.controller.js";


const router = Router();

router.get("/:query", searchMedia);

export default router;