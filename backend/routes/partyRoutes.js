import express from "express";
const router = express.Router();

import {addParty, getAllParties} from "../controllers/partyController.js"
import userAuth from "../middleware/userAuth.js";


router.post("/add-party",userAuth,addParty)
router.get("/get-all-parties",userAuth,getAllParties)
export default router;