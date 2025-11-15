
import db from "../config/db.js";
import { sanitizeObject } from "../utils/sanitizeInput.js";
import partySchema from "../validators/partySchema.js";



const addParty = async (req, res, next) => {
  let connection;
  try {
  

    connection = await db.getConnection();
    await connection.beginTransaction();
    const cleanData = sanitizeObject(req.body);
    const validation = partySchema.safeParse(cleanData);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const {
      Party_Name,
      GSTIN,
      Phone_Number,
     
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
      
    } = validation.data;

    if (!Party_Name) {
      await connection.rollback();
      return res.status(400).json({ message: "Party name is required" });
    }

    // Get last party code
    const [last] = await db.query(
      "SELECT Party_Id FROM add_party ORDER BY id DESC LIMIT 1"
    );

    let newId = "PTY001";
    if (last.length > 0) {
      const lastId = last[0].Party_Id; // e.g. "PTY005"
      const num = parseInt(lastId.replace("PTY", "")) + 1;
      newId = "PTY" + num.toString().padStart(3, "0");
    }
  const cleanValue = (val) =>
    val !== undefined && val !== null && String(val).trim() !== "" ? val : null;
    // Insert into DB
    const [result] = await db.execute(
      `INSERT INTO add_party 
       (Party_Id, Party_Name, GSTIN, Phone_Number,  State, Email_Id, Billing_Address, Shipping_Address)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [
        newId,
        Party_Name,
        cleanValue(GSTIN),
        cleanValue(Phone_Number),
      
        cleanValue(State),
        cleanValue(Email_Id),
        cleanValue(Billing_Address),
        cleanValue(Shipping_Address),
        
      ]
    );

      await connection.commit();
    return res.status(201).json({
      message: "Party added successfully",
      success: true,
      id: result.insertId, // auto-increment primary key
      Party_Id: newId,     // custom party code
      Party_Name,
      GSTIN,
      Phone_Number,
     
      State,
      Email_Id,
      Billing_Address,
      Shipping_Address,
     
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error adding party:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) {
      connection.release();
    }
  }
};


const getAllParties = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = 10;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : "";

    let whereClause = "";
    let params = [];

    // 🔎 Search (optional)
    if (search) {
      whereClause = `
        WHERE LOWER(Party_Name) LIKE ? 
           OR LOWER(GSTIN) LIKE ? 
           OR LOWER(Phone_Number) LIKE ? 
           OR LOWER(State) LIKE ? 
           OR LOWER(Email_Id) LIKE ? 
           OR LOWER(Billing_Address) LIKE ?
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }

    let rows, totalParties;

    if (page) {
      // 📄 Pagination mode
      const offset = (page - 1) * limit;
      const query = `
        SELECT * 
        FROM add_party
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const countQuery = `
        SELECT COUNT(*) AS total 
        FROM add_party
        ${whereClause}
      `;
      const [data] = await db.query(query, [...params, limit, offset]);
      const [count] = await db.query(countQuery, params);

      rows = data;
      totalParties = count[0].total;

      return res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalParties / limit),
        totalParties,
        parties: rows,
      });
    } else {
      // 🧾 Non-paginated mode (used in dropdowns, exports, etc.)
      const query = `
        SELECT * 
        FROM add_party
        ${whereClause}
        ORDER BY created_at DESC
      `;
      const [data] = await db.query(query, params);

      return res.status(200).json({
        success: true,
        totalParties: data.length,
        parties: data,
      });
    }
  } catch (err) {
    if (connection ) connection.release();
    console.error("❌ Error getting all parties:", err);
    next(err);
    // return res.status(500).json({ message: "Internal Server Error" });
  }finally {
    if (connection) {
      connection.release();
    }
  }
};



export { addParty,getAllParties };  // ✅ for ESM
