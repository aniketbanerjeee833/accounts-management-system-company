



// 🔹 Helper: digits only
// const digitsOnly = (fieldName, required = true) =>
//   z.string({
//       required_error: `${fieldName} is required`,
//     })
//     .or(z.literal("")) // allow empty if optional
//     .refine((val) => {
//       if (!val) return !required; // empty allowed only if optional
//       return /^\d+$/.test(val); // digits only
//     }, {
//       message: `${fieldName} must contain digits only`,
//     });

// export const purchaseFormSchema = z.object({
//   Party_Name: z.string().min(1, "Party_Name is required"),
//   Item_Name: z.string().min(1, "Item_Name is required"),
//   Bill_Number: z.string().min(1, "Bill_Number is required"),

//   Bill_Date: z
//     .string()
//     .refine((val) => !isNaN(Date.parse(val)), {
//       message: "Bill_Date must be a valid date",
//     }),

//   State_Of_Supply: z.string().min(1, "State_Of_Supply is required"),

//   // 🔹 Auto-calculated → optional
//   Total_Amount: digitsOnly("Total_Amount", false),
//   Balance_Due: digitsOnly("Balance_Due", false),

//   // 🔹 Optional but must be digits if given
//   Total_Paid: digitsOnly("Total_Paid", false),

//   // Payment_Type: z.enum(["Cash", "Cheque", "Online"], {
//   //   required_error: "Payment_Type is required",
//   // }),
//  Payment_Type: z.enum(["Cash", "Cheque", "Online"]).default("Cash").optional(),
//   Reference_Number: z.string().optional().or(z.literal("")),

  

//   Stock_Quantity: digitsOnly("Stock_Quantity"),
 


//   items: z
//     .array(
//       z.object({
//         item: z.string().min(1, "Item name is required"),
//         qty: numberField("Quantity").refine((val) => val > 0, {
//           message: "Quantity must be greater than 0",
//         }),
//          Purchase_Price: digitsOnly("Purchase_Price"),
//           Purchase_Price_Type: z.enum(["With Tax", "Without Tax"]),
//          Discount_On_Purchase_Price: digitsOnly("Discount_On_Purchase_Price", false),
//   Discount_Type_On_Purchase_Price: z
//     .enum(["Percentage", "Amount"])
//     .optional(),

//         Tax_Type: z.enum([
//           "None",
//           "GST0",
//           "IGST0",
//           "GST5",
//           "GST12",
//           "GST18",
//           "GST28",
//         ]),
//         Tax_Amount: digitsOnly("Tax_Amount", false),
//         Amount: digitsOnly("Amount"),
//       })
//     )
//     .nonempty("At least one item must be added"),
// });
import { z } from "zod";
const HSN_REGEX = /^\d{4,8}$/;
// ✅ Digits only helper
// const digitsOnly = (fieldName, required = true) =>
//   z
//     .union([z.string(), z.number()])  // allow both
//     .refine(
//       (val) => {
//         const strVal = String(val);
//         if (!strVal) return !required;
//         return /^\d+(\.\d{1,2})?$/.test(strVal);
//       },
//       { message: `${fieldName} is required and should be a number` }
//     )
//     .transform((val) => Number(val)); // ✅ always store as number
const digitsOnly = (fieldName, required = true) =>
  z.union([z.string(), z.number()])
    .transform((val) => String(val ?? "").trim())
    .refine(
      (val) => (required ? val !== "" : true),
      { message: `${fieldName} is required` }
    )
    .refine(
      (val) => val === "" || /^\d+(\.\d{1,2})?$/.test(val),
      { message: `${fieldName} must be a valid number` }
    )
    .transform((val) => (val === "" ? 0 : Number(val)));

// ✅ Schema
export const purchaseFormSchema = z.object({
  Party_Name: z.string().min(1, "Party_Name is required"),
  // GSTIN: z
  //   .string()
  //   .transform((v) => v ?? "")   // ⬅️ ALWAYS convert undefined → ""
  //   .refine((v) => v.length === 0 || v.length === 15, {
  //     message: "GSTIN must be exactly 15 characters",
  //   }),
  
  
  //  GSTIN: z
  //   .string()
  //   .trim()
  //   .refine(val => val.length === 15, {
  //     message: "GSTIN must be exactly 15 characters"
  //   }),
    // GSTIN: z
    // .string()
    // .trim()
    // .refine(val => val.length === 15, {
    //   message: "GSTIN must be exactly 15 characters"
    // }),
        GSTIN: z.string().min(15, "GSTIN must be at least 15 characters")
        .max(15, "GSTIN must be at most 15 characters"),
  Bill_Number: z.string().min(1, "Bill_Number is required"),

  Bill_Date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Bill_Date must be a valid date",
    }),

  State_Of_Supply: z.string().min(1, "State_Of_Supply is required"),

  // 🔹 Auto-calculated but cannot be empty
  Total_Amount: digitsOnly("Total_Amount", true),
  Balance_Due: digitsOnly("Balance_Due", true),

  // 🔹 Optional but digits if provided
  Total_Paid: z.string().optional().or(digitsOnly("Total_Paid", false)),
  Payment_Type: z
      .enum(["Cash", "Cheque", "Neft"])
      .or(z.literal("")) // allow blank select
      .refine((val) => val !== "", {
        message: "Please select a payment type.",
      }),
  // Payment_Type: z.enum(["Cash", "Cheque", "Neft"]).default("Cash"),
  Reference_Number: z
  .string()
  .trim()
  .optional()
  .or(z.literal("")),

  // Stock_Quantity: digitsOnly("Stock_Quantity"),

  items: z
    .array(
      z.object({
           Item_Category: z.string().min(1, "Item category is required"),
        Item_Name: z.string().min(1, "Item name is required"),
        //  Item_HSN: z.string().min(4, "HSN Code is required") max(8, "HSN Code must be at most 20 characters"),.
        // Item_HSN: z.string()
        //     // 1. Enforce length (4 to 8 characters)
        //     .min(4, "HSN Code must be at least 4 digits.")
        //     .max(8, "HSN Code must be at most 8 digits.")
        //     // 2. Enforce only digits (0-9)
        //     .regex(HSN_REGEX, "HSN Code must contain only digits (0-9)."),
        
Item_HSN: z
  .union([
    z.string(),
    z.number(),
    z.undefined(),
    z.null(),
  ])
  .transform((val) => (val === undefined || val === null ? "" : String(val))) // ✅ Always a string
  .refine((val) => val.trim() !== "", { message: "HSN Code is required." })
  .refine((val) => /^\d+$/.test(val), { message: "HSN Code must contain only digits (0-9)." })
  .refine((val) => val.length >= 4, { message: "HSN Code must be at least 4 digits." })
  .refine((val) => val.length <= 8, { message: "HSN Code must be at most 8 digits." }),
     
        //  Quantity: digitsOnly("Quantity", false).default(1),
          Quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .min(1, "Quantity must be greater than zero"),
  //     Quantity: z
  // .number({
  //   required_error: "Quantity is required",
  //   invalid_type_error: "Quantity must be a number",
  // })
  // .min(1, "Quantity must be greater than zero"),
        Item_Unit: z.string().min(1, "Unit is required"),
             Purchase_Price: digitsOnly("Purchase_Price", true).refine(
          (num) => num >= 1,
          { message: "Purchase Price must be  greater than 0" }
        ),
        // Purchase_Price: digitsOnly("Purchase_Price", false),
        // Purchase_Price_Type: z.enum(["With Tax", "Without Tax"]),
        Discount_On_Purchase_Price: digitsOnly("Discount_On_Purchase_Price", false).optional(),
        Discount_Type_On_Purchase_Price: z.enum(["Percentage", "Amount"]).optional(),
        Tax_Type: z.string().min(1, "Tax_Type is required").optional().default("None"), // ✅ no need to validate enum, UI ensures correctness
        Tax_Amount: digitsOnly("Tax_Amount", false),
        Amount: digitsOnly("Amount", false),
      })
    )
    .nonempty("At least one item must be added"),
});
