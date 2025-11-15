import express from "express";
import { addInvoice, addSale,addNewSale, editSale, getAllSales, getLatestInvoiceNumber, getSingleInvoice,
     getSingleSale, printSaleBill, updateInvoice, 
     getAllNewSales,
     editNewSale,
     addNewSaleInvoice,
     updateNewSaleInvoice,
     getSingleNewSaleInvoice,
     getNewSaleLatestInvoiceNumber,
     getTotalNewSalesEachDay,
     getTotalSalesEachDay} from "../controllers/saleController.js";
import userAuth from "../middleware/userAuth.js";
const router = express.Router();



router.post("/add-sale",userAuth,addSale)
router.post("/add-new-sale",userAuth,addNewSale)
router.get("/get-all-sales",userAuth,getAllSales)
router.get("/get-all-new-sales",userAuth,getAllNewSales)
router.get("/get-single-sale/:Sale_Id",userAuth,getSingleSale)

router.post("/add-invoice",userAuth,addInvoice)
router.put("/update-invoice/",userAuth,updateInvoice)
router.get("/get-single-invoice",userAuth,getSingleInvoice)

router.post("/add-new-sale-invoice",userAuth,addNewSaleInvoice)
router.put("/update-new-sale-invoice",userAuth,updateNewSaleInvoice)
router.get("/get-single-new-sale-invoice",userAuth,getSingleNewSaleInvoice)

router.get("/get-latest-invoice-number",userAuth,getLatestInvoiceNumber)
router.get("/get-latest-new-sale-invoice-number",userAuth,getNewSaleLatestInvoiceNumber)

router.post("/print-sale-invoice",userAuth,printSaleBill)
router.put("/edit-sale/:Sale_Id",userAuth,editSale)
router.put("/edit-new-sale/:Sale_Id",userAuth,editNewSale)

router.get("/total-new-sales-by-day",userAuth,getTotalNewSalesEachDay)
router.get("/total-sales-by-day",userAuth,getTotalSalesEachDay)

export default router;