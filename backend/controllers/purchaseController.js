import db from "../config/db.js"; // mysql2/promise connection
import purchaseSchema from "../validators/purchaseSchema.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";





const cleanValue = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return null; // store as NULL in DB
  }
  return value;  // ✅ returns the original value for valid data
};
const cleanDiscount = (value) => {
  if (value === undefined || value === null || value === "" || value === " ") {
    return 0.00; // store as 0.00 in DB
  }
  return Number(value);
}
const normalizeNumber = (val) =>
  val !== undefined && val !== null && String(val).trim() !== ""
    ? Number(val)
    : null;

// const addPurchase = async (req, res, next) => {
//   try {
//     // const {
//     //   Party_Name,
//     //   Bill_Number,
//     //   Bill_Date,
//     //   State_Of_Supply,
//     //   Total_Amount,
//     //   Total_Paid,
//     //   Balance_Due,
//     //   Payment_Type,
//     //   Reference_Number,
//     //   items,
//     // } = req.body;

//     const cleanData= sanitizeObject(req.body);
//     const validation = purchaseSchema.safeParse(cleanData);
//     if (!validation.success) {
//       return res.status(400).json({ errors: validation.error.errors });
//     }
//     const {
//       Party_Name,
//       Bill_Number,
//       Bill_Date,
//       State_Of_Supply,
//       Total_Amount,
//       Total_Paid,
//       Balance_Due,
//       Payment_Type,
//       Reference_Number,
//       items,
//     } = validation.data;
//     // 🔹 Validation
//     if (
//       !Party_Name ||
//       !Bill_Number ||
//       !Bill_Date ||
//       !State_Of_Supply ||
//       !Array.isArray(items) ||
//       items.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Star marked fields missing or items empty " });
//     }

//     // 🔹 Get Party_Id
//     const [partyRows] = await db.execute(
//       `SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1`,
//       [Party_Name]
//     );
//     if (partyRows.length === 0) {
//       return res.status(404).json({ message: "Party not found" });
//     }
//     const Party_Id = partyRows[0].Party_Id;

//     // 🔹 Generate new Purchase_Id
//     const [last] = await db.query(
//       "SELECT Purchase_Id FROM add_purchase ORDER BY id DESC LIMIT 1"
//     );
//     let newPurchaseId = "PUR001";
//     if (last.length > 0) {
//       const lastId = last[0].Purchase_Id;
//       const num = parseInt(lastId.replace("PUR", "")) + 1;
//       newPurchaseId = "PUR" + num.toString().padStart(3, "0");
//     }

//     // 1️⃣ Insert purchase record
//     await db.execute(
//       `INSERT INTO add_purchase 
//        (Party_Id, Purchase_Id, Bill_Number, Bill_Date, State_Of_Supply,
//         Total_Amount, Total_Paid, Balance_Due, Payment_Type, Reference_Number, 
//         created_at, updated_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         Party_Id,
//         newPurchaseId,
//         Bill_Number,
//         Bill_Date,
//         State_Of_Supply,
//         cleanValue(Total_Amount),
//         cleanValue(Total_Paid),
//         cleanValue(Balance_Due),
//         cleanValue(Payment_Type),
//         cleanValue(Reference_Number),
//       ]
//     );

//     // 2️⃣ Process items
//     for (const item of items) {
//       const {
//         Item_Category,
//         Item_Name,
//         Item_HSN,
//         Quantity,
//         Item_Unit,
//         Purchase_Price,
//         Discount_On_Purchase_Price,
//         Discount_Type_On_Purchase_Price,
//         Tax_Type,
//         Tax_Amount,
//         Amount,
//         Item_Image,
//       } = item;

//            if (Item_HSN) {
//         const [hsnCheck] = await db.execute(
//           `SELECT Item_Name FROM add_item WHERE Item_HSN = ? AND Item_Name != ? LIMIT 1`,
//           [Item_HSN, Item_Name]
//         );
//         if (hsnCheck.length > 0) {
//           return res.status(400).json({
//             message: `HSN '${Item_HSN}' already belongs to another item '${hsnCheck[0].Item_Name}'.`,
//           });
//         }
//       }
//       // 🔹 Step A: Ensure item exists or add new
//       const [itemRows] = await db.execute(
//         `SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1`,
//         [Item_Name]
//       );

//       let Item_Id;

//       if (itemRows.length === 0) {
//         // ✅ No item with this name → create new
//         const [lastItem] = await db.query(
//           "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
//         );
//         let newItemId = "ITM001";
//         if (lastItem.length > 0) {
//           const lastId = lastItem[0].Item_Id;
//           const num = parseInt(lastId.replace("ITM", "")) + 1;
//           newItemId = "ITM" + num.toString().padStart(3, "0");
//         }

//         await db.execute(
//           `INSERT INTO add_item (
//             Item_Name, Item_Id, Item_HSN, Item_Unit, Item_Image, Item_Category,Stock_Quantity,
//             created_at, updated_at
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//           [
//             Item_Name,
//             newItemId,
//             Item_HSN,
//             Item_Unit,
//             cleanValue(Item_Image),
//             Item_Category,
//             normalizeNumber(Quantity) 
//           ]
//         );

//         Item_Id = newItemId;
//       } else {
//         const existingItem = itemRows[0];
//         Item_Id = existingItem.Item_Id;

//         // ❌ Same name but different HSN → throw error
//         if (
//           existingItem.Item_Name.trim().toLowerCase() ===
//             Item_Name.trim().toLowerCase() &&
//           existingItem.Item_HSN.trim() !== (Item_HSN || "").trim()
//         ) {
//           return res.status(400).json({
//             message: `Item '${Item_Name}' already exists with a different HSN (${existingItem.Item_HSN}).`,
//           });
//         }
        
//         // ✅ Same name + same HSN → update stock
//         await db.execute(
//           `UPDATE add_item 
//            SET Stock_Quantity = Stock_Quantity + ?,
//                updated_at = NOW()
//            WHERE Item_Id = ?`,
//           [normalizeNumber(Quantity) || 0, Item_Id]
//         );
//       }

//       // 🔹 Step B: Insert into add_purchase_items
//       const [lastPurchaseItem] = await db.query(
//         "SELECT Purchase_items_Id FROM add_purchase_items ORDER BY id DESC LIMIT 1"
//       );
//       let newPurchaseItemId = "PIT001";
//       if (lastPurchaseItem.length > 0) {
//         const lastId = lastPurchaseItem[0].Purchase_items_Id;
//         const num = parseInt(lastId.replace("PIT", "")) + 1;
//         newPurchaseItemId = "PIT" + num.toString().padStart(3, "0");
//       }

//       await db.execute(
//         `INSERT INTO add_purchase_items 
//          (Purchase_items_Id, Purchase_Id, Item_Id, Quantity, 
//           Purchase_Price,
//           Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price, 
//           Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [
//           newPurchaseItemId,
//           newPurchaseId,
//           Item_Id,
//           normalizeNumber(Quantity),
//           normalizeNumber(Purchase_Price),
//           Discount_On_Purchase_Price,
//           cleanValue(Discount_Type_On_Purchase_Price),
//           cleanValue(Tax_Type),
//           normalizeNumber(Tax_Amount),
//           normalizeNumber(Amount),
//         ]
//       );
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Purchase and items added successfully",
//       purchaseId: newPurchaseId,
//     });
//   } catch (err) {
//     console.error("❌ Error adding purchase:", err);
//     next(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const addPurchase = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); // ✅ Start transaction

    const cleanData = sanitizeObject(req.body);
    const validation = purchaseSchema.safeParse(cleanData);
    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      Party_Name,
      Bill_Number,
      Bill_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Paid,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (
      !Party_Name ||
      !Bill_Number ||
      !Bill_Date ||
      !State_Of_Supply ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Star marked fields missing or items empty." });
    }
   const itemCountMap = new Map();
    for (const item of items) {
      const itemName = item.Item_Name?.trim().toLowerCase();
      if (!itemName) {
        
        return res.status(400).json({ message: "Item name missing." });
      }

      const qty = Number(item.Quantity) || 0;
      itemCountMap.set(itemName, (itemCountMap.get(itemName) || 0) + qty);
          const duplicates = [...itemCountMap.entries()].filter(([name]) =>
      items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
    );
    if (duplicates.length > 0) {
      const names = duplicates.map(([n]) => `'${n}'`).join(", ");
    
      return res.status(400).json({
        message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
      });
    }
    }
    // 🔹 Get Party_Id
    const [partyRows] = await connection.execute(
      "SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1",
      [Party_Name]
    );
    if (partyRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Party not found." });
    }
    const Party_Id = partyRows[0].Party_Id;

    // 🔹 Generate new Purchase_Id
    const [lastPurchase] = await connection.query(
      "SELECT Purchase_Id FROM add_purchase ORDER BY id DESC LIMIT 1"
    );
    let newPurchaseId = "PUR001";
    if (lastPurchase.length > 0) {
      const lastNum = parseInt(lastPurchase[0].Purchase_Id.replace("PUR", "")) + 1;
      newPurchaseId = "PUR" + lastNum.toString().padStart(3, "0");
    }

    // 🔹 Insert Purchase Master
    await connection.execute(
      `INSERT INTO add_purchase 
       (Party_Id, Purchase_Id, Bill_Number, Bill_Date, State_Of_Supply,
        Total_Amount, Total_Paid, Balance_Due, Payment_Type, Reference_Number, 
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        Party_Id,
        newPurchaseId,
        Bill_Number,
        Bill_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Paid),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
      ]
    );

    // 🔹 Fetch last Purchase Item ID once (for incremental generation)
    // const [lastPurchaseItem] = await connection.query(
    //   "SELECT Purchase_items_Id FROM add_purchase_items ORDER BY id DESC LIMIT 1"
    // );
    // let nextPurchaseItemNum = 1;
    // if (lastPurchaseItem.length > 0) {
    //   nextPurchaseItemNum =
    //     parseInt(lastPurchaseItem[0].Purchase_items_Id.replace("PIT", "")) + 1;
    // }
    const [maxRow] = await connection.query(
  `SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) 
  AS maxNum FROM add_purchase_items`
);
let nextPurchaseItemNum = (maxRow[0]?.maxNum || 0) + 1;
    console.log("nextPurchaseItemNum", nextPurchaseItemNum);
    // 🔹 Loop through items
    for (const item of items) {
      const {
        Item_Category,
        Item_Name,
        Item_HSN,
        Quantity,
        Item_Unit,
        Purchase_Price,
        Discount_On_Purchase_Price,
        Discount_Type_On_Purchase_Price,
        Tax_Type,
        Tax_Amount,
        Amount,
        Item_Image,
      } = item;

      // Check for duplicate HSNs
      if (Item_HSN) {
        const [hsnCheck] = await connection.execute(
          `SELECT Item_Name FROM add_item WHERE Item_HSN = ? AND Item_Name != ? LIMIT 1`,
          [Item_HSN, Item_Name]
        );
        if (hsnCheck.length > 0) {
          await connection.rollback();
          return res.status(400).json({
            message: `HSN '${Item_HSN}' already belongs to another item '${hsnCheck[0].Item_Name}'.`,
          });
        }
      }

      // Check if item already exists
      const [itemRows] = await connection.execute(
        "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
        [Item_Name]
      );

      let Item_Id;
      if (itemRows.length === 0) {
        // Create new item
        const [lastItem] = await connection.query(
          "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
        );

        let newItemId = "ITM001";
        if (lastItem.length > 0) {
          const lastNum = parseInt(lastItem[0].Item_Id.replace("ITM", "")) + 1;
          newItemId = "ITM" + lastNum.toString().padStart(3, "0");
        }

        await connection.execute(
          `INSERT INTO add_item 
           (Item_Id, Item_Name, Item_HSN, Item_Unit, Item_Image, Item_Category, Stock_Quantity, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            newItemId,
            Item_Name,
            Item_HSN || "",
            Item_Unit || "",
            cleanValue(Item_Image),
            Item_Category || "",
            normalizeNumber(Quantity),
          ]
        );

        Item_Id = newItemId;
      } else {
        // Existing item → update stock
        const existingItem = itemRows[0];
        Item_Id = existingItem.Item_Id;

        if (
          existingItem.Item_HSN &&
          Item_HSN &&
          existingItem.Item_HSN.trim() !== Item_HSN.trim()
        ) {
          await connection.rollback();
          return res.status(400).json({
            message: `Item '${Item_Name}' already exists with different HSN (${existingItem.Item_HSN}).`,
          });
        }

        await connection.execute(
          `UPDATE add_item 
           SET Stock_Quantity = Stock_Quantity + ?, updated_at = NOW()
           WHERE Item_Id = ?`,
          [normalizeNumber(Quantity), Item_Id]
        );
      }

      // Generate unique Purchase_items_Id
      // const newPurchaseItemId =
      //   "PIT" + nextPurchaseItemNum.toString().padStart(3, "0");
      // nextPurchaseItemNum++;
   const newPurchaseItemId = "PIT" + nextPurchaseItemNum.toString().padStart(3, "0");
      nextPurchaseItemNum++;

      // Insert purchase item
      await connection.execute(
        `INSERT INTO add_purchase_items 
         (Purchase_items_Id, Purchase_Id, Item_Id, Quantity, Purchase_Price,
          Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price,
          Tax_Type, Tax_Amount, Amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          newPurchaseItemId,
          newPurchaseId,
          Item_Id,
          normalizeNumber(Quantity),
          normalizeNumber(Purchase_Price),
          cleanDiscount(Discount_On_Purchase_Price),
          cleanValue(Discount_Type_On_Purchase_Price),
          cleanValue(Tax_Type),
          normalizeNumber(Tax_Amount),
          normalizeNumber(Amount),
        ]
      );
    }

    await connection.commit(); // ✅ Commit only if all inserts succeed

    return res.status(201).json({
      success: true,
      message: "Purchase and items added successfully",
      purchaseId: newPurchaseId,
    });
  } catch (err) {
    if (connection) await connection.rollback(); // ❌ Rollback everything on failure
    console.error("❌ Error adding purchase:", err);
    next(err);
  } finally {
    if (connection) connection.release(); // ✅ Always release connection
  }
};

const getAllPurchases = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const fromDate = req.query.fromDate || null;
    const toDate = req.query.toDate || null;

    console.log("🔍 Params =>", { page, search, fromDate, toDate });

    let whereClauses = [];
    let params = [];

    // 🔎 Search
    if (search) {
      whereClauses.push(`
        (LOWER(a.Party_Name) LIKE ? 
         OR LOWER(p.Payment_Type) LIKE ? 
         OR LOWER(p.Balance_Due) LIKE ? 
         OR LOWER(p.Total_Amount) LIKE ?)
      `);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    // 📅 Date Range
    if (fromDate && toDate) {
      whereClauses.push("DATE(p.created_at) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      whereClauses.push("DATE(p.created_at) >= ?");
      params.push(fromDate);
    } else if (toDate) {
      whereClauses.push("DATE(p.created_at) <= ?");
      params.push(toDate);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 🧠 Main Paginated Query
    const query = `
      SELECT p.*, a.Party_Name
      FROM add_purchase p
      LEFT JOIN add_party a ON p.Party_Id = a.Party_Id
      ${whereSQL}
     ORDER BY GREATEST(p.created_at, p.updated_at) DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // 🧾 Get total count
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM add_purchase p
      LEFT JOIN add_party a ON p.Party_Id = a.Party_Id
      ${whereSQL}
      `,
      params.slice(0, params.length - 2)
    );

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(countResult[0].total / limit),
      totalPurchases: countResult[0].total,
      purchases: rows,
    });
  } catch (err) {
     if (connection) connection.release();
    console.error("❌ Error fetching purchases:", err);
    next(err);
    //return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) connection.release();
  }
};




 const editPurchase = async (req, res, next) => {
  let connection;
  try {

    const { Purchase_Id: purchaseId } = req.params;
    connection = await db.getConnection();
    await connection.beginTransaction();
    // 1️⃣ Check if sale exists
    const [existingPurchase] = await connection.query(
      "SELECT * FROM add_purchase WHERE Purchase_Id = ?",
      [purchaseId]
    );
    if (existingPurchase.length === 0) {
      return res.status(404).json({ message: "No such Sale found." });
    }

    // 2️⃣ Validate & sanitize request
    const cleanData = sanitizeObject(req.body);
    const validation = purchaseSchema.safeParse(cleanData);
    if (!validation.success) {
      await connection.rollback();
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
     
            Party_Name,
      Bill_Number,
      Bill_Date,
      State_Of_Supply,
      Total_Amount,
      Total_Paid,
      Balance_Due,
      Payment_Type,
      Reference_Number,
      items,
    } = validation.data;

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "No purchase items provided, please add at least one item." });
    }


   const itemCountMap = new Map();
    for (const item of items) {
      const name = item.Item_Name?.trim().toLowerCase();
      if (!name) {
        await connection.rollback();
        return res.status(400).json({ message: "Item name missing in one or more entries." });
      }

      itemCountMap.set(name, (itemCountMap.get(name) || 0) + item.Quantity);
    }

    const duplicates = [...itemCountMap.entries()].filter(([name]) =>
      items.filter((it) => it.Item_Name?.trim().toLowerCase() === name).length > 1
    );
    if (duplicates.length > 0) {
      const names = duplicates.map(([n]) => `'${n}'`).join(", ");
      await connection.rollback();
      return res.status(400).json({
        message: `Duplicate items detected: ${names}. Please ensure each item appears only once.`,
      });
    }

    // 🧩 4️⃣ Fetch Party_Id
    const [partyRows] = await connection.query(
      "SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1",
      [Party_Name]
    );
    if (partyRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Party not found." });
    }
    // 3️⃣ Restore previous stock before validation
    const [oldItems] = await connection.query(
      "SELECT Item_Id, Quantity FROM add_purchase_items WHERE Purchase_Id = ?",
      [purchaseId]
    );

    for (const old of oldItems) {
      await connection.query(
        `UPDATE add_item 
         SET Stock_Quantity = Stock_Quantity - ?, updated_at = NOW() 
         WHERE Item_Id = ?`,
        [old.Quantity, old.Item_Id]
      );
    }

 

    // 5️⃣ Update sale master
    await connection.query(
      `UPDATE add_purchase SET 
        Party_Id = (SELECT Party_Id FROM add_party WHERE Party_Name = ? LIMIT 1),
        Bill_Number = ?, 
        Bill_Date = ?, 
        State_Of_Supply = ?, 
        Total_Amount = ?, 
        Total_Paid = ?, 
        Balance_Due = ?, 
        Payment_Type = ?, 
        Reference_Number = ?, 
        updated_at = NOW()
       WHERE Purchase_Id = ?`,
      [
        Party_Name,
        Bill_Number,
        Bill_Date,
        State_Of_Supply,
        cleanValue(Total_Amount),
        cleanValue(Total_Paid),
        cleanValue(Balance_Due),
        cleanValue(Payment_Type),
        cleanValue(Reference_Number),
        purchaseId,
      ]
    );

    // 6️⃣ Fetch old sale items and build map
    const [oldPurchaseItems] = await connection.query(
      "SELECT Purchase_items_Id, Item_Id, Quantity, created_at FROM add_purchase_items WHERE Purchase_Id = ?",
      [purchaseId]
    );
    const oldPurchaseItemMap = new Map();
    for (const old of oldPurchaseItems) {
      oldPurchaseItemMap.set(old.Item_Id, old);
    }
const [maxIdRow] = await connection.query(
  "SELECT MAX(CAST(SUBSTRING(Purchase_items_Id, 4) AS UNSIGNED)) AS maxId FROM add_purchase_items"
);
let nextPurchaseItemNum = (maxIdRow[0]?.maxId || 0) + 1;
   console.log(nextPurchaseItemNum);
    // Delete old sale items (to reinsert updated)
    await connection.query("DELETE FROM add_purchase_items WHERE Purchase_Id = ?", [purchaseId]);

    // Generate base number for Purchase_Items_Id sequence
    // const [latestItem] = await connection.query(
    //   "SELECT Purchase_items_Id FROM add_purchase_items ORDER BY id DESC LIMIT 1"
    // );
  

   
   // 7️⃣ Reinsert updated purchase items & adjust stock
// for (const item of items) {
//   const {
//     Item_Name,
//     Item_Category,
//     Item_HSN,
//     Item_Unit,
//     Quantity,
//     Purchase_Price,
//     Discount_On_Purchase_Price,
//     Discount_Type_On_Purchase_Price,
//     Tax_Type,
//     Tax_Amount,
//     Amount,
//   } = item;

//   // 1️⃣ Check if item exists in inventory
//   const [existingItem] = await connection.query(
//     "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
//     [Item_Name]
//   );

//   let Item_Id;
//   let isNewItem = false;

//   if (existingItem.length === 0) {
//     // 2️⃣ Create a new item record
//     const [lastItem] = await connection.query(
//       "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
//     );
//     let newItemId = "ITM001";
//     if (lastItem.length > 0) {
//       const lastNum = parseInt(lastItem[0].Item_Id.replace("ITM", "")) + 1;
//       newItemId = "ITM" + lastNum.toString().padStart(3, "0");
//     }

//     await connection.query(
//       `INSERT INTO add_item 
//        (Item_Id, Item_Name, Item_Category, Item_HSN, Item_Unit, Stock_Quantity, created_at, updated_at)
//        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//       [
//         newItemId,
//         Item_Name,
//         Item_Category || "",
//         Item_HSN || "",
//         Item_Unit || "",
//         normalizeNumber(Quantity), // initialize with purchased qty
//       ]
//     );

//     Item_Id = newItemId;
//     isNewItem = true;
//   } else {
//     Item_Id = existingItem[0].Item_Id;
//   }

//   // 3️⃣ Reuse or generate Purchase_items_Id
//   const oldData = oldPurchaseItemMap.get(Item_Id);
//   let Purchase_items_Id;
//   let createdAt;

//   if (oldData) {
//     Purchase_items_Id = oldData.Purchase_items_Id;
//     createdAt = oldData.created_at;
//   } else {
//     const num = baseNum + purchaseItemCounter++;
//     Purchase_items_Id = "PIT" + num.toString().padStart(3, "0");
//     createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
//   }

//   // 4️⃣ Insert purchase item
//   await connection.query(
//     `INSERT INTO add_purchase_items 
//      (Purchase_items_Id, Purchase_Id, Item_Id, Quantity, Purchase_Price, 
//       Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price, 
//       Tax_Type, Tax_Amount, Amount, created_at, updated_at)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//     [
//       Purchase_items_Id,
//       purchaseId,
//       Item_Id,
//       normalizeNumber(Quantity),
//       normalizeNumber(Purchase_Price),
//       cleanDiscount(Discount_On_Purchase_Price),
//       cleanValue(Discount_Type_On_Purchase_Price),
//       cleanValue(Tax_Type),
//       normalizeNumber(Tax_Amount),
//       normalizeNumber(Amount),
//       createdAt,
//     ]
//   );

//   // 5️⃣ Update stock (always increase for purchases)
//   if (!isNewItem) {
//     await connection.query(
//       `UPDATE add_item 
//        SET Stock_Quantity = Stock_Quantity + ?, updated_at = NOW()
//        WHERE Item_Id = ?`,
//       [normalizeNumber(Quantity), Item_Id]
//     );
//   }
// }
// 🧩 6️⃣ Fetch latest Purchase_items_Id only once
// const [latestPurchaseItem] = await connection.query(
//   "SELECT Purchase_items_Id FROM add_purchase_items ORDER BY id DESC LIMIT 1"
// );

// let nextItemNumber = 1;
// if (latestPurchaseItem.length > 0) {
//   const lastNum = parseInt(latestPurchaseItem[0].Purchase_items_Id.replace("PIT", "")) || 0;
//   nextItemNumber = lastNum + 1;
// }
const [maxItemRow] = await connection.query(`
  SELECT MAX(CAST(SUBSTRING(Item_Id, 4) AS UNSIGNED)) AS maxItem 
  FROM add_item
`);
let nextItemNum = (maxItemRow[0]?.maxItem || 0) + 1;
// 7️⃣ Reinsert updated purchase items & adjust stock
for (const item of items) {
  const {
    Item_Name,
    Item_Category,
    Item_HSN,
    Item_Unit,
    Quantity,
    Purchase_Price,
    Discount_On_Purchase_Price,
    Discount_Type_On_Purchase_Price,
    Tax_Type,
    Tax_Amount,
    Amount,
  } = item;

  // 1️⃣ Check if item exists
  const [existingItem] = await connection.query(
    "SELECT * FROM add_item WHERE Item_Name = ? LIMIT 1",
    [Item_Name]
  );

  let Item_Id;
  let isNewItem = false;

  if (existingItem.length === 0) {
    // Create new item in inventory
    // const [lastItem] = await connection.query(
    //   "SELECT Item_Id FROM add_item ORDER BY id DESC LIMIT 1"
    // );

    // let newItemId = "ITM001";
    // if (lastItem.length > 0) {
    //   const lastNum = parseInt(lastItem[0].Item_Id.replace("ITM", "")) + 1;
    //   newItemId = "ITM" + lastNum.toString().padStart(3, "0");
    // }
  Item_Id = "ITM" + nextItemNum.toString().padStart(3, "0");
    nextItemNum++; // increment counter safely for next item
    await connection.query(
      `INSERT INTO add_item 
       (Item_Id, Item_Name, Item_Category, Item_HSN, Item_Unit, Stock_Quantity, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newItemId,
        Item_Name,
        Item_Category || "",
        Item_HSN || "",
        Item_Unit || "",
        normalizeNumber(Quantity),
      ]
    );

    Item_Id = newItemId;
    isNewItem = true;
  } else {
    Item_Id = existingItem[0].Item_Id;
  }

  // 2️⃣ Reuse or create new Purchase_items_Id
  const oldData = oldPurchaseItemMap.get(Item_Id);
  let Purchase_items_Id;
  let createdAt;

  if (oldData) {
    Purchase_items_Id = oldData.Purchase_items_Id;
    createdAt = oldData.created_at;
  } else {
    // Generate next unique ID safely
     Purchase_items_Id = "PIT" + nextPurchaseItemNum.toString().padStart(3, "0")
    // Purchase_items_Id = "PIT" + nextItemNumber.toString().padStart(3, "0");
    nextPurchaseItemNum++; // increment safely for next new item
    createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  // 3️⃣ Insert into add_purchase_items
  await connection.query(
    `INSERT INTO add_purchase_items 
     (Purchase_items_Id, Purchase_Id, Item_Id, Quantity, Purchase_Price, 
      Discount_On_Purchase_Price, Discount_Type_On_Purchase_Price, 
      Tax_Type, Tax_Amount, Amount, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      Purchase_items_Id,
      purchaseId,
      Item_Id,
      normalizeNumber(Quantity),
      normalizeNumber(Purchase_Price),
      cleanDiscount(Discount_On_Purchase_Price),
      cleanValue(Discount_Type_On_Purchase_Price),
      cleanValue(Tax_Type),
      normalizeNumber(Tax_Amount),
      normalizeNumber(Amount),
      createdAt,
    ]
  );

  // 4️⃣ Update stock (increase for purchases)
  if (!isNewItem) {
    await connection.query(
      `UPDATE add_item 
       SET Stock_Quantity = Stock_Quantity + ?, updated_at = NOW()
       WHERE Item_Id = ?`,
      [normalizeNumber(Quantity), Item_Id]
    );
  }
}


    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      purchaseId,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Error editing purchase:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
};
const getSinglePurchase = async (req, res, next) => {
  let connection;
  try {
    const { Purchase_Id: purchaseId } = req.params;

    connection = await db.getConnection();

    if (!purchaseId) {
      return res.status(400).json({ success: false, message: "Purchase ID is required." });
    }

    // ✅ Fetch sale header (includes invoice + party info)
    const [purchaseData] = await db.query(
      `
      SELECT 
        pu.Purchase_Id,
        pu.Bill_Number,
        pu.Bill_Date,
        pu.Reference_Number,
        pu.State_Of_Supply,
        pu.Payment_Type,
        pu.Total_Amount,
        pu.Total_Paid,
        pu.Balance_Due,
        pu.Party_Id,
        p.Party_Name,
        p.GSTIN,
        p.Billing_Address,
        p.Shipping_Address
      FROM add_purchase pu
      LEFT JOIN add_party p ON pu.Party_Id = p.Party_Id
      WHERE pu.Purchase_Id = ?
      `,
      [purchaseId]
    );

    if (purchaseData.length === 0) {
      return res.status(404).json({ success: false, message: "Sale not found." });
    }

    const purchaseHeader = purchaseData[0];

    // ✅ Fetch all sale items related to that Sale_Id
    const [items] = await db.query(
      `
      SELECT 
        pi.Purchase_Items_Id,
        pi.Item_Id,
        i.Item_Name,
        i.Item_HSN,
        i.Item_Unit,
        i.Item_Category,
        pi.Quantity,
        pi.Purchase_Price,
        pi.Discount_On_Purchase_Price,
        pi.Discount_Type_On_Purchase_Price,
        pi.Tax_Amount,
        pi.Tax_Type,
        pi.Amount,
        pi.created_at
      FROM add_purchase_items pi
      LEFT JOIN add_item i ON pi.Item_Id = i.Item_Id
      WHERE pi.Purchase_Id = ?
      ORDER BY pi.created_at DESC
      `,
      [purchaseId]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: "No sale items found for this invoice." });
    }

    // ✅ Combine and send response
    const response = {
      success: true,
      billPurchaseDetails: {
        Purchase_Id: purchaseHeader.Purchase_Id,
        Party_Name: purchaseHeader.Party_Name,
        GSTIN: purchaseHeader.GSTIN,
        State_Of_Supply: purchaseHeader.State_Of_Supply,
        Reference_Number: purchaseHeader.Reference_Number,
        Bill_Number: purchaseHeader.Bill_Number,
        Bill_Date: purchaseHeader.Bill_Date,
        Payment_Type: purchaseHeader.Payment_Type,
        Total_Amount: purchaseHeader.Total_Amount,
        Total_Paid: purchaseHeader.Total_Paid,
        Balance_Due: purchaseHeader.Balance_Due,
        Billing_Address: purchaseHeader.Billing_Address,
        Shipping_Address: purchaseHeader.Shipping_Address,
      },
      items: items.map((it) => ({
        Purchase_Items_Id: it.Purchase_Items_Id,
        Item_Id: it.Item_Id,
        Item_Name: it.Item_Name,
        Item_HSN: it.Item_HSN,
        Item_Unit: it.Item_Unit,
        Item_Category: it.Item_Category,
        Quantity: it.Quantity,
        Purchase_Price: it.Purchase_Price,
        Discount_On_Purchase_Price: it.Discount_On_Purchase_Price,
        Discount_Type_On_Purchase_Price: it.Discount_Type_On_Purchase_Price,
        Tax_Amount: it.Tax_Amount,
        Tax_Type: it.Tax_Type,
        Amount: it.Amount,
        created_at: it.created_at,
      })),
    };

    return res.status(200).json(response);
  } catch (err) {
        if (connection) connection.release();
    console.error("❌ Error getting single sale:", err);
    next(err);
  }finally {
    if (connection) connection.release();
  }
};

const getTotalPurchasesEachDay = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();

    // ✅ Correct SQL: group by date, count total sales per day
    const [rows] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') AS purchase_date,
        COUNT(*) AS total_purchases
      FROM add_purchase
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY purchase_date ASC;
      `
    );

    // ✅ Format response
    const result = rows.map((r) => ({
      date: r.purchase_date,
      total_purchases: r.total_purchases,
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if(connection) connection.release();
    console.error("❌ Error getting total new sales by day:", err);
    next(err);
  } finally {
    if (connection) connection.release();
  }
};
export  { addPurchase,editPurchase,getSinglePurchase,getAllPurchases,getTotalPurchasesEachDay };


