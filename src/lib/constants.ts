export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Lurix Pharma",
  shortName: "LurixPharma",
  description: "Next-Generation Pharmacy Management System with Real-Time Stock & Cloud Intelligence",
  currency: "৳",
  defaultLowStockThreshold: 10,
  timezone: "Asia/Dhaka",
};

export const MEDICINE_UNITS = [
  "Tablet",
  "Strip",
  "Box",
  "Bottle",
  "Piece",
  "Vial",
  "Ampoule",
  "Capsule",
  "Sachet",
  "Syrup",
] as const;

export type MedicineUnit = (typeof MEDICINE_UNITS)[number];

export const PAYMENT_METHODS = ["Cash", "bKash", "Nagad"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Salary",
  "Transport",
  "Maintenance",
  "Utility",
  "Custom",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const USER_ROLES = ["SuperAdmin", "Admin", "Employee"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUS = ["Pending", "Active", "Disabled"] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export const ALL_PERMISSIONS = [
  "view_dashboard",
  "manage_sales", // POS & sales
  "view_stock",
  "manage_stock", // Add/edit stock quantity & costs
  "manage_prices", // Edit medicine selling prices
  "manage_accounts", // View daily accounts
  "manage_expenses", // Add/edit expenses
  "view_reports", // Access detailed reports
  "manage_users", // Approve, assign permissions & limits
  "manage_settings", // Pharmacy settings
  "edit_cancel_sales", // Edit or cancel existing sales
  "csv_import_export", // Import/export inventory CSV
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];
