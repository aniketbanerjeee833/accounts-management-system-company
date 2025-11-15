CREATE TABLE `add_item_sale` (
  `id` int(11) NOT NULL,
  `Item_Id` varchar(255) NOT NULL,
  `Item_Name` varchar(255) NOT NULL,
  `Item_HSN` varchar(255) NOT NULL,
  `Item_Unit` varchar(255) NOT NULL,
  `Item_Image` varchar(255) DEFAULT NULL,
  `Item_Category` varchar(255) NOT NULL,
  `Stock_Quantity` int(10) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) 

--