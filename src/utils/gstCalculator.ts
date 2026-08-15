import { GstMode } from './constants';

export interface GstCalculation {
  basePrice: number;
  gstAmount: number;
  totalPrice: number;
  cgst: number;
  sgst: number;
}

/**
 * Calculate GST based on price and mode
 * @param price - The price (either including or excluding GST)
 * @param gstPercentage - GST percentage (e.g., 18 for 18%)
 * @param mode - 'including' if price includes GST, 'excluding' if not
 */
export const calculateGst = (
  price: number,
  gstPercentage: number,
  mode: GstMode
): GstCalculation => {
  let basePrice: number;
  let gstAmount: number;
  let totalPrice: number;

  if (mode === 'including') {
    // Price includes GST, calculate base price
    totalPrice = price;
    basePrice = price / (1 + gstPercentage / 100);
    gstAmount = totalPrice - basePrice;
  } else {
    // Price excludes GST, calculate total price
    basePrice = price;
    gstAmount = (price * gstPercentage) / 100;
    totalPrice = basePrice + gstAmount;
  }

  // CGST and SGST are half of total GST each (for intra-state transactions)
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
  };
};

/**
 * Format currency in Indian Rupee format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number in Indian format (with lakhs and crores)
 */
export const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (mrp: number, sellingPrice: number): number => {
  if (mrp <= 0) return 0;
  const discount = ((mrp - sellingPrice) / mrp) * 100;
  return Math.round(discount * 100) / 100;
};

/**
 * Parse price from string, handling Indian format
 */
export const parsePrice = (priceString: string): number => {
  // Remove currency symbols and commas
  const cleaned = priceString.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
};
