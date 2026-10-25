import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Bangladeshi Taka (৳)
 */
export function formatBDT(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "৳0.00";
  }
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("BDT", "৳");
}

/**
 * Clean string normalizer for medicine duplicate checks
 */
export function normalizeMedicineName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
