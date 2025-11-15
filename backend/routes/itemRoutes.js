import express from "express";
const router = express.Router();

import {addCategory, addItem,addNewSaleItem,getAllCategories,getAllItems, getAllNewItems} from "../controllers/itemController.js"
import userAuth from "../middleware/userAuth.js";
router.post("/add-item",userAuth,addItem)
router.post("/add-new-sale-item",userAuth,addNewSaleItem)
router.get("/get-all-items",userAuth,getAllItems)
router.get("/get-all-new-items",userAuth,getAllNewItems)
router.post("/add-category",userAuth,addCategory)
router.get("/get-all-categories",userAuth,getAllCategories)
export default router;