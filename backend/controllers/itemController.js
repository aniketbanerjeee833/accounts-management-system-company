

import db from "../config/db.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import itemFormSchema from "../validators/itemSchema.js";

const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value;  // ✅ returns the original value for valid data
};
{/* Add Item */}
const addItem = async (req, res, next) => {
  let connection;
  try {
        connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction
    // ✅ Validate request body with Zod
    const cleanData = sanitizeObject(req.body);
    const validation = itemFormSchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { Item_Name, Item_HSN, Item_Unit, Item_Image, Item_Category } =
      validation.data;

    // ✅ Check duplicate
    const [rows] = await db.query(
      `SELECT * FROM add_item WHERE Item_Name = ?`,
      [Item_Name]
    );
    if (rows.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Item already exists, please add a new item" });
    }

    // ✅ Generate new Item_Id
    const [last] = await db.query(
      "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
    );

    let itemId = "ITM001";
    if (last.length > 0) {
      const lastId = last[0].Item_Id; // e.g. "ITM005"
      const num = parseInt(lastId.replace("ITM", "")) + 1;
      itemId = "ITM" + num.toString().padStart(3, "0");
    }

    // ✅ Insert into DB
    const [result] = await db.execute(
      `INSERT INTO add_item (
        Item_Name, Item_Id, Item_HSN, Item_Unit, Item_Image, Item_Category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [Item_Name, itemId, Item_HSN, Item_Unit, cleanValue(Item_Image), Item_Category]
    );
    await connection.commit();
    return res.status(201).json({
      message: "Item added successfully",
      success: true,
      id: result.insertId,
      itemId,
    });
  } catch (err) {
    // if (err.code === "ER_DUP_ENTRY") {
    //   return res.status(400).json({ message: "Duplicate entry" });
    // }
    if(connection) await connection.rollback();
    console.error("❌ Error adding item:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) connection.release();
  }
};



// const getAllItems = async (req, res, next) => {
//   try {
//     const page = req.query.page ? parseInt(req.query.page, 10) : null;
//     const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
//     const limit = 10;

//     const offset = page ? (page - 1) * limit : 0;

//     // ✅ Base SQL query
//     let baseQuery = `SELECT * FROM add_item`;
//     let whereClause = "";
//     const params = [];

//     // ✅ Search filter across multiple columns
//     if (search) {
//       whereClause = `
//         WHERE LOWER(Item_Name) LIKE ? 
//         OR LOWER(Item_Category) LIKE ? 
//         OR LOWER(Item_HSN) LIKE ? 
//         OR LOWER(Item_Id) LIKE ? 
//         OR LOWER(Item_Unit) LIKE ?
//       `;
//       const likeSearch = `%${search}%`;
//       params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
//     }

//     // ✅ Pagination support
//     let query = `${baseQuery} ${whereClause} ORDER BY created_at DESC`;
//     if (page) query += ` LIMIT ? OFFSET ?`, params.push(limit, offset);

//     const [items] = await db.query(query, params);

//     // ✅ Get total count for pagination
//     let totalItems = [{ total: 0 }];
//     if (page) {
//       const [countRows] = await db.query(
//         `SELECT COUNT(*) AS total FROM add_item ${whereClause}`,
//         search ? Array(5).fill(`%${search}%`) : []
//       );
//       totalItems = countRows;
//     } else {
//       totalItems = [{ total: items.length }];
//     }

//     // ✅ Fetch purchase & sale prices
//     const [purchaseItems] = await db.query(
//       `SELECT Item_Id, Purchase_Price 
//        FROM add_purchase_items 
//        ORDER BY created_at DESC`
//     );
//     const [salesItems] = await db.query(
//       `SELECT Item_Id, Sale_Price 
//        FROM add_sale_items 
//        ORDER BY created_at DESC`
//     );

//     const latestPurchasePrice = {};
//     purchaseItems.forEach((row) => {
//       if (!latestPurchasePrice[row.Item_Id]) {
//         latestPurchasePrice[row.Item_Id] = row.Purchase_Price;
//       }
//     });
//     const latestSalePrice = {};
//     salesItems.forEach((row) => {
//       if (!latestSalePrice[row.Item_Id]) {
//         latestSalePrice[row.Item_Id] = row.Sale_Price;
//       }
//     });

//     // ✅ Combine results
//     const combined = items.map((item) => ({
//       Item_Id: item.Item_Id,
//       Item_Category: item.Item_Category,
//       Item_Name: item.Item_Name,
//       Item_HSN: item.Item_HSN,
//       Item_Unit: item.Item_Unit,
//       Stock_Quantity: item.Stock_Quantity || 0,
//       Purchase_Price: latestPurchasePrice[item.Item_Id] || 0.0,
//       Sale_Price: latestSalePrice[item.Item_Id] || 0.0,
//       created_at: item.created_at,
//     }));

//     // ✅ Response
//     if (page) {
//       return res.status(200).json({
//         currentPage: page,
//         totalPages: Math.ceil(totalItems[0].total / limit),
//         totalItems: totalItems[0].total,
//         items: combined,
//       });
//     } else {
//       return res.status(200).json({
//         items: combined,
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error getting all items:", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

//Recent items purchase and sale
const addNewSaleItem = async (req, res, next) => {
  let connection;
  try {
    // ✅ Validate request body with Zod
    connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction
    const cleanData = sanitizeObject(req.body);
    const validation = itemFormSchema.safeParse(cleanData);
    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { Item_Name, Item_HSN, Item_Unit, Item_Image, Item_Category } =
      validation.data;

    // ✅ Check duplicate
    const [rows] = await db.query(
      `SELECT * FROM add_item_sale WHERE Item_Name = ?`,
      [Item_Name]
    );
    if (rows.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Item already exists, please add a new item" });
    }

    // ✅ Generate new Item_Id
    const [last] = await db.query(
      "SELECT Item_Id FROM add_item_sale ORDER BY id DESC LIMIT 1"
    );

    let itemId = "ITMS001";
    if (last.length > 0) {
      const lastId = last[0].Item_Id; // e.g. "ITM005"
      const num = parseInt(lastId.replace("ITMS", "")) + 1;
      itemId = "ITMS" + num.toString().padStart(4, "0");
    }

    // ✅ Insert into DB
    const [result] = await db.execute(
      `INSERT INTO add_item_sale (
        Item_Name, Item_Id, Item_HSN, Item_Unit, Item_Image, Item_Category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [Item_Name, itemId, Item_HSN, Item_Unit, cleanValue(Item_Image), Item_Category]
    );
    await connection.commit();
    return res.status(201).json({
      message: "Item added successfully",
      success: true,
      id: result.insertId,
      itemId,
    });
  } catch (err) {
 
 if (connection) await connection.rollback()
    console.error("❌ Error adding item:", err);
    next(err);
   
  }finally {
   if (connection) connection.release();
  }
};
const getAllItems = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    console.log(fromDate, toDate,search,page);
    const limit = 10;
    const offset = page ? (page - 1) * limit : 0;

    // ✅ Build WHERE clause dynamically
    let whereClauses = [];
    let params = [];

    // 🧠 Search term condition
    if (search) {
      whereClauses.push(`
        (LOWER(Item_Name) LIKE ? 
         OR LOWER(Item_Category) LIKE ? 
         OR LOWER(Item_HSN) LIKE ? 
         OR LOWER(Item_Id) LIKE ? 
         OR LOWER(Item_Unit) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    // 📅 Date range condition
    if (fromDate && toDate) {
      whereClauses.push("DATE(created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(created_at) <= ?");
      params.push(toDate);
    }

    // Combine WHERE clauses
    const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

    // ✅ Fetch items
    const query = `
      SELECT * FROM add_item 
      ${whereSQL}
      ORDER BY created_at DESC
      ${page ? "LIMIT ? OFFSET ?" : ""}
    `;
    if (page) params.push(limit, offset);

    const [items] = await db.query(query, params);

    // ✅ Count total for pagination
    let [totalItems] = await db.query(
      `SELECT COUNT(*) AS total FROM add_item ${whereSQL}`,
      params.slice(0, params.length - (page ? 2 : 0))
    );

    // ✅ Get latest purchase and sales prices
    const [purchaseItems] = await db.query(`
      SELECT Item_Id, Purchase_Price,Tax_Type 
      FROM add_purchase_items 
      ORDER BY GREATEST(created_at, updated_at) DESC
    `);
    const [salesItems] = await db.query(`
      SELECT Item_Id, Sale_Price 
      FROM add_sale_items 
      ORDER BY GREATEST(created_at, updated_at) DESC
    `);

    const latestPurchasePrice = {};
    const latestTaxType = {};
    purchaseItems.forEach((row) => {
      if (!latestPurchasePrice[row.Item_Id]) {
        latestPurchasePrice[row.Item_Id] = row.Purchase_Price;
        latestTaxType[row.Item_Id] = row.Tax_Type;
      }
    });
    const latestSalePrice = {};
    salesItems.forEach((row) => {
      if (!latestSalePrice[row.Item_Id]) {
        latestSalePrice[row.Item_Id] = row.Sale_Price;
      }
    });

    // ✅ Merge results
    const combined = items.map((item) => ({
      ...item,
      Purchase_Price: latestPurchasePrice[item.Item_Id] || 0.0,
      Tax_Type: latestTaxType[item.Item_Id],
      Sale_Price: latestSalePrice[item.Item_Id] || 0.0,
    }));

      console.log(combined);
    // ✅ Response
    return res.status(200).json({
      success: true,
      currentPage: page || 1,
      totalPages: page ? Math.ceil(totalItems[0].total / limit) : 1,
      totalItems: totalItems[0].total,
      items: combined,
    });
  } catch (err) {
    if(connection) connection.release();
    console.error("❌ Error fetching items:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection)  connection.release();
  }
};
const getAllNewItems = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    console.log(fromDate, toDate,search,page);
    const limit = 10;
    const offset = page ? (page - 1) * limit : 0;

    // ✅ Build WHERE clause dynamically
    let whereClauses = [];
    let params = [];

    // 🧠 Search term condition
    if (search) {
      whereClauses.push(`
        (LOWER(Item_Name) LIKE ? 
         OR LOWER(Item_Category) LIKE ? 
         OR LOWER(Item_HSN) LIKE ? 
         OR LOWER(Item_Id) LIKE ? 
         OR LOWER(Item_Unit) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    // 📅 Date range condition
    if (fromDate && toDate) {
      whereClauses.push("DATE(created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(created_at) <= ?");
      params.push(toDate);
    }

    // Combine WHERE clauses
    const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

    // ✅ Fetch items
    const query = `
      SELECT * FROM add_item_sale 
      ${whereSQL}
      ORDER BY created_at DESC
      ${page ? "LIMIT ? OFFSET ?" : ""}
    `;
    if (page) params.push(limit, offset);

    const [items] = await db.query(query, params);

    // ✅ Count total for pagination
    let [totalItems] = await db.query(
      `SELECT COUNT(*) AS total FROM add_item_sale ${whereSQL}`,
      params.slice(0, params.length - (page ? 2 : 0))
    );

    // ✅ Get latest purchase and sales prices
    // const [purchaseItems] = await db.query(`
    //   SELECT Item_Id, Purchase_Price,Tax_Type 
    //   FROM add_purchase_items 
    //   ORDER BY GREATEST(created_at, updated_at) DESC
    // `);
    const [salesItems] = await db.query(`
      SELECT Item_Id, Sale_Price 
      FROM add_new_sale_items 
      ORDER BY GREATEST(created_at, updated_at) DESC
    `);

    //const latestPurchasePrice = {};
    const latestTaxType = {};
    // purchaseItems.forEach((row) => {
    //   if (!latestPurchasePrice[row.Item_Id]) {
    //     latestPurchasePrice[row.Item_Id] = row.Purchase_Price;
    //     latestTaxType[row.Item_Id] = row.Tax_Type;
    //   }
    // });
    const latestSalePrice = {};
    salesItems.forEach((row) => {
      if (!latestSalePrice[row.Item_Id]) {
        latestSalePrice[row.Item_Id] = row.Sale_Price;
      }
    });

    // ✅ Merge results
    const combined = items.map((item) => ({
      ...item,
      
      Tax_Type: latestTaxType[item.Item_Id],
      Sale_Price: latestSalePrice[item.Item_Id] || 0.0,
    }));

      console.log(combined);
    // ✅ Response
    return res.status(200).json({
      success: true,
      currentPage: page || 1,
      totalPages: page ? Math.ceil(totalItems[0].total / limit) : 1,
      totalItems: totalItems[0].total,
      items: combined,
    });
  } catch (err) {
    if(connection) connection.release();
    console.error("❌ Error fetching items:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection)  connection.release();
  }
};


{/* add category */}
const addCategory = async (req, res, next) => {
  let connection;
  try {
    const { Item_Category } = req.body;
    connection = await db.getConnection();

    if (!Item_Category) {
      await connection.rollback();
      return res.status(400).json({success: false, message: "Item_Category is required" });
    }

    // Trim + collapse spaces
    const updatedCategory = Item_Category.trim().replace(/\s+/g, " ");

    // Check if already exists (case-insensitive)
    const [rows] = await db.query(
      `SELECT * FROM add_category WHERE LOWER(Item_Category) = LOWER(?)`,
      [updatedCategory]
    );

    if (rows.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Item_Category already exists" });
    }

    // Generate Category_Id
    let newId = "CAT001";
    const [last] = await db.query(
      "SELECT Category_Id FROM add_category ORDER BY id DESC LIMIT 1"
    );

    if (last.length > 0) {
      const lastId = last[0].Category_Id; // e.g. "CAT005"
      const num = parseInt(lastId.replace("CAT", "")) + 1;
      newId = "CAT" + num.toString().padStart(3, "0");
    }

    // ✅ Insert new category (2 placeholders for 2 values)
    const [result] = await db.execute(
      `INSERT INTO add_category (Category_Id, Item_Category, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [newId, updatedCategory]
    );
await connection.commit();
   return res.status(201).json({
  message: "Item_Category added successfully",
  success: true,
  id: result.insertId, // auto-increment primary key
  Category_Id: newId,
  Item_Category: updatedCategory,
});
  } catch (err) {
    if(connection) await connection.rollback();
    console.error("❌ Error adding Item_Category:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
        if(connection) await connection.rollback()
  }
};

const getAllCategories = async (req, res, next) => {
  let connection;
  try{
      connection = await db.getConnection();
      const [rows] = await db.query("SELECT * FROM add_category  ORDER BY created_at DESC");
      return res.status(200).json(rows);
  }catch(err){
       if(connection) connection.release();
      console.error("❌ Error getting all categories:", err);
      next(err);
      // return res.status(500).json({ message: "Internal Server Error" });
  }finally{
      if(connection) connection.release();
  }
}
export { addItem ,addNewSaleItem,addCategory,getAllItems,getAllNewItems,getAllCategories};
