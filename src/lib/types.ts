import { ObjectId } from "mongodb";
import { UserRole, UserStatus, Permission, PaymentMethod, ExpenseCategory } from "./constants";

export interface UnitConversion {
  unitName: string; // e.g. "Strip", "Box"
  conversionFactor: number; // e.g. 10 base units per Strip
  sellingPrice: number; // explicit selling price for this unit
}

export interface IMedicine {
  _id?: ObjectId;
  name: string; // e.g. "Napa Extra 500mg"
  banglaName?: string; // e.g. "নাপা এক্সট্রা"
  normalizedName: string;
  category?: string;
  notes?: string;
  baseUnit: string; // e.g. "Tablet"
  baseSellingPrice: number; // selling price per base unit
  averagePurchaseCost: number; // weighted average cost per base unit
  currentStock: number; // quantity in base stock units
  lowStockThreshold: number; // default 10
  conversions: UnitConversion[];
  imageUrl?: string;
  imageFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleItem {
  medicineId: string;
  medicineName: string;
  unit: string; // selected unit (base or converted)
  quantity: number; // quantity in selected unit
  baseQuantity: number; // quantity converted to base unit
  unitPrice: number; // snapshot selling price per chosen unit
  historicalBaseCost: number; // snapshot weighted average cost per base unit
  subtotal: number;
}

export interface ISale {
  _id?: ObjectId;
  invoiceNumber: string; // e.g. "INV-20261025-001"
  items: ISaleItem[];
  subtotal: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
  totalBaseCost: number; // COGS: sum of (baseQuantity * historicalBaseCost)
  grossProfit: number; // finalTotal - totalBaseCost
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  changeAmount?: number;
  soldByUid: string;
  soldByName: string;
  isCancelled: boolean;
  cancelledAt?: Date;
  cancelledByUid?: string;
  cancelledByName?: string;
  cancellationReason?: string;
  editedAt?: Date;
  editedByUid?: string;
  createdAt: Date;
}

export interface IExpense {
  _id?: ObjectId;
  category: ExpenseCategory;
  customCategory?: string;
  amount: number;
  note?: string;
  expenseDate: Date;
  createdByUid: string;
  createdByName: string;
  createdAt: Date;
}

export interface IUserProfile {
  _id?: ObjectId;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  maxDiscountPercent: number; // e.g. 10%
  maxDiscountFixed: number; // e.g. 500 ৳
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id?: ObjectId;
  actorUid: string;
  actorName: string;
  actorEmail?: string;
  action: string; // e.g. "CREATE_MEDICINE", "POS_SALE", "EDIT_SALE", "CANCEL_SALE", "USER_APPROVAL"
  entityType: "medicine" | "sale" | "expense" | "user" | "setting";
  entityId?: string;
  details: Record<string, any>;
  createdAt: Date;
}

export interface IPharmacySettings {
  _id?: ObjectId;
  pharmacyName: string;
  receiptHeader?: string;
  receiptFooter?: string;
  phone?: string;
  address?: string;
  defaultLowStockThreshold: number;
  updatedAt: Date;
}
