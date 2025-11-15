CREATE TABLE `add_new_sale_items` (
  `id` int(11) NOT NULL,
  `Sale_Id` varchar(255) NOT NULL,
  `Item_Id` varchar(255) NOT NULL,
  `Sale_Items_Id` varchar(255) NOT NULL,
  `Quantity` int(10) NOT NULL,
  `Sale_Price` decimal(10,2) DEFAULT NULL,
  `Discount_On_Sale_Price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Discount_Type_On_Sale_Price` enum('Percentage','Amount') NOT NULL DEFAULT 'Percentage',
  `Tax_Type` varchar(255) NOT NULL,
  `Tax_Amount` decimal(10,2) DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) 