// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics Components',
  'Microcontroller Boards',
  'Electronic Modules',
  'Displays',
  'Battery & Charger',
  'IoT / Wireless Boards',
  'Sensors',
  'Power Supply',
  'Mic & Speaker',
  'Motors & Motor Drivers',
  'Relays',
  'Drone Parts',
  'Equipment',
  'Miscellaneous',
  'Engineering Zone',
  'Innovation Zone',
  '3D Printing Service',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'destructive',
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  FAILED: 'failed',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  failed: 'Failed',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'success',
  unpaid: 'warning',
  failed: 'destructive',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export type StockStatus = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

// GST Modes
export const GST_MODES = {
  INCLUDING: 'including',
  EXCLUDING: 'excluding',
} as const;

export type GstMode = typeof GST_MODES[keyof typeof GST_MODES];

// Common GST Rates in India
export const GST_RATES = [0, 5, 12, 18, 28] as const;

// Time Period Filters
export const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  CUSTOM_YEAR: 'custom-year',
} as const;

export type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS];

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  'custom-year': 'Custom Year',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  USER: 'user',
  REVIEW: 'review',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
