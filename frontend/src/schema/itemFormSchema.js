import { z } from "zod";

// 🔹 Reusable helper for numeric fields (allows "", number, or valid string-number, else error)
// const numberOrNull = (fieldName) =>
//   z
//     .union([z.string(), z.number(), z.undefined()]) // allow undefined
//     .transform((val) => {
//       if (val === undefined || val === null || val === "") return null;
//       return Number(val);
//     })
//     .refine((val) => val === null || !isNaN(val), {
//       message: `${fieldName} must be a number`,
//     })
//     .nullable();

// export const itemFormSchema = z.object({
//   Item_Name: z.string().min(1, "Item Name is required"),

//   // If Item_Id comes from frontend automatically you can enable validation
//   // Item_Id: z.string().min(1, "Item Id is required"),

//   Item_Code: z.string().optional().nullable(),

//   Item_HSN: z
//     .string()
//     .max(20, "HSN Code must be at most 20 characters")
//     .optional()
//     .nullable(),

//   Item_Unit: z.string().optional().nullable(),

//   Item_Image: z.string().optional().nullable(),

//   Category: z.string().optional().nullable(),

//   // 🔹 Numbers with validation
//   Sale_Price: numberOrNull("Sale Price"),
//   Sale_Price_Type: z.enum(["With Tax", "Without Tax"]).default("Without Tax"),

//   Discount_On_Sale_Price: numberOrNull("Discount on Sale Price"),
//   Discount_Type_On_Sale_Price: z.enum(["Percentage", "Amount"]).default("Percentage"),

//   Wholesale_Price: numberOrNull("Wholesale Price"),
//   Wholesale_Price_Type: z.enum(["With Tax", "Without Tax"]).default("Without Tax"),
//   Minimum_Wholesale_Qty: numberOrNull("Minimum Wholesale Quantity"),

//   Purchase_Price: numberOrNull("Purchase Price"),
//   Purchase_Price_Type: z.enum(["With Tax", "Without Tax"]).default("Without Tax"),

//   Taxes: z.string().optional().nullable(),

//   Stock_Opening_Quantity: numberOrNull("Stock Opening Quantity"),
//   Stock_Price: numberOrNull("Stock Price"),

//   Stock_As_Of_Date: z
//     .string()
//     .refine((val) => !val || !isNaN(Date.parse(val)), {
//       message: "Invalid date format",
//     })
//     .nullable()
//     .optional(),

//   Stock_Minimum_Qty: numberOrNull("Stock Minimum Quantity"),
//   Stock_Location: z.string().optional().nullable(),
// });


// const numberOrNull = (fieldName) =>
//   z
//     .union([z.string(), z.number(), z.undefined()])
//     .transform((val) => {
//       if (val === undefined || val === null) return null;

//       if (typeof val === "string") {
//         const trimmed = val.trim();
//         if (trimmed === "") return null;
//         return Number(trimmed);
//       }

//       return Number(val);
//     })
//     .refine((val) => val === null || !isNaN(val), {
//       message: `${fieldName} must be a number`,
//     })
//     .nullable();
const HSN_REGEX = /^\d{4,8}$/;
export const itemFormSchema = z.object({
  Item_Name: z.string().min(1, "Item Name is required"),

//   Item_Code: z.string().optional().nullable(),

//   Item_HSN: z
//     .string()
//     .max(20, "HSN Code must be at most 20 characters")
//     .optional()
//     .nullable(),
Item_HSN: z.string()
    // 1. Enforce length (4 to 8 characters)
    .min(4, "HSN Code must be at least 4 digits.")
    .max(8, "HSN Code must be at most 8 digits.")
    // 2. Enforce only digits (0-9)
    .regex(HSN_REGEX, "HSN Code must contain only digits (0-9)."),
//  Item_HSN: z
//     .string()
//     .min(1, "HSN Code is required")
//     .max(20, "HSN Code must be at most 20 characters"),
 Item_Unit: z.string().min(1, "Unit is required"),
  Item_Image: z.string().optional().nullable(),
  Item_Category: z
    .string()
    .min(1, "At least one category is required"),


});
