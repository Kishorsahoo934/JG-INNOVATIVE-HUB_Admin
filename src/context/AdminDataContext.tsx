import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { User, Product, Order, Payment, Review, Notification } from '@/services/adminApi';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  usersApi,
  productsApi,
  ordersApi,
  paymentsApi,
  reviewsApi,
  notificationsApi,
} from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

interface AdminDataState {
  users: User[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
  isLoading: boolean;
}

type AdminDataAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['orderStatus'] } }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { id: string; status: Order['paymentStatus'] } }
  | { type: 'UPDATE_TRACKING'; payload: { id: string; trackingLink?: string; trackingMessage?: string } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AdminDataState = {
  users: [],
  products: [],
  orders: [],
  payments: [],
  reviews: [],
  notifications: [],
  isLoading: false,
};

function adminDataReducer(state: AdminDataState, action: AdminDataAction): AdminDataState {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, orderStatus: action.payload.status, updatedAt: new Date().toISOString() } : o
        ),
      };
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, paymentStatus: action.payload.status, updatedAt: new Date().toISOString() } : o
        ),
      };
    case 'UPDATE_TRACKING':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id
            ? {
                ...o,
                trackingLink: action.payload.trackingLink ?? o.trackingLink,
                trackingMessage: action.payload.trackingMessage ?? o.trackingMessage,
                updatedAt: new Date().toISOString(),
              }
            : o
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AdminDataContextType {
  state: AdminDataState;
  refreshData: () => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStock: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => Promise<void>;
  updateTracking: (orderId: string, data: { trackingLink?: string; trackingMessage?: string }) => Promise<void>;
  approveReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  getDashboardStats: () => {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    pendingReviews: number;
    unreadNotifications: number;
  };
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminDataReducer, initialState);
  const { toast } = useToast();
  const { isAuthenticated } = useAdminAuth();

  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [users, products, orders, payments, reviews, notifications] = await Promise.all([
        usersApi.getAll().catch(() => []),
        productsApi.getAll().catch(() => []),
        ordersApi.getAll().catch(() => []),
        paymentsApi.getAll().catch(() => []),
        reviewsApi.getAll().catch(() => []),
        notificationsApi.getAll().catch(() => []),
      ]);
      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_ORDERS', payload: orders });
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
      dispatch({ type: 'SET_REVIEWS', payload: reviews });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated, refreshData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const notifications = await notificationsApi.getAll().catch(() => []);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      } catch {
        // silent polling failure
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleUserStatus = useCallback(
    async (userId: string) => {
      const user = state.users.find((u) => u.id === userId);
      const newStatus = user?.status === 'active' ? 'blocked' : 'active';
      try {
        await usersApi.updateStatus(userId, newStatus);
        await refreshData();
        toast({ title: 'User Updated', description: `User has been ${newStatus} successfully` });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [state.users, refreshData, toast]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        await usersApi.delete(userId);
        await refreshData();
        toast({ title: 'User Deleted', description: 'User has been removed successfully' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const addProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await productsApi.create(productData);
        await refreshData();
        toast({ title: 'Product Added', description: `${productData.name} has been added successfully` });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
        throw err;
      }
    },
    [refreshData, toast]
  );

  const updateProduct = useCallback(
    async (productId: string, data: Partial<Product>) => {
      try {
        await productsApi.update(productId, data);
        await refreshData();
        toast({ title: 'Product Updated', description: 'Product has been updated successfully' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
        throw err;
      }
    },
    [refreshData, toast]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        await productsApi.delete(productId);
        await refreshData();
        toast({ title: 'Product Deleted', description: 'Product has been removed successfully' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const toggleProductStock = useCallback(
    async (productId: string) => {
      const product = state.products.find((p) => p.id === productId);
      const newStatus = product?.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
      try {
        await productsApi.updateStock(productId, newStatus);
        await refreshData();
        toast({ title: 'Stock Updated', description: `${product?.name} is now ${newStatus === 'out_of_stock' ? 'out of stock' : 'in stock'}` });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [state.products, refreshData, toast]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order['orderStatus']) => {
      try {
        await ordersApi.updateStatus(orderId, status);
        await refreshData();
        toast({ title: 'Order Updated', description: `Order status changed to ${status}` });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const updatePaymentStatus = useCallback(
    async (orderId: string, status: Order['paymentStatus']) => {
      try {
        await ordersApi.updatePaymentStatus(orderId, status);
        dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { id: orderId, status } });
        toast({ title: 'Payment Updated', description: `Payment status changed to ${status}` });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [toast]
  );

  const approveReview = useCallback(
    async (reviewId: string) => {
      try {
        await reviewsApi.updateStatus(reviewId, 'approved');
        await refreshData();
        toast({ title: 'Review Approved', description: 'Review has been approved and is now visible' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const updateTracking = useCallback(
    async (orderId: string, data: { trackingLink?: string; trackingMessage?: string }) => {
      try {
        await ordersApi.updateTracking(orderId, data);
        dispatch({ type: 'UPDATE_TRACKING', payload: { id: orderId, ...data } });
        toast({ title: 'Tracking Updated', description: 'Tracking details updated successfully' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [toast]
  );

  const rejectReview = useCallback(
    async (reviewId: string) => {
      try {
        await reviewsApi.updateStatus(reviewId, 'rejected');
        await refreshData();
        toast({ title: 'Review Rejected', description: 'Review has been rejected' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      try {
        await reviewsApi.delete(reviewId);
        await refreshData();
        toast({ title: 'Review Deleted', description: 'Review has been removed' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const markNotificationRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsApi.markAsRead(notificationId);
        await refreshData();
      } catch {
        // Optimistic update
      }
    },
    [refreshData]
  );

  const markAllNotificationsRead = useCallback(
    async () => {
      try {
        await notificationsApi.markAllAsRead();
        await refreshData();
        toast({ title: 'Notifications Cleared', description: 'All notifications marked as read' });
      } catch (err) {
        toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      }
    },
    [refreshData, toast]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsApi.delete(notificationId);
        await refreshData();
      } catch {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          payload: state.notifications.filter((n) => n.id !== notificationId),
        });
      }
    },
    [state.notifications, refreshData]
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotif: Notification = {
        ...notification,
        id: `NOT${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: [newNotif, ...state.notifications],
      });
    },
    [state.notifications]
  );

  const getDashboardStats = useCallback(
    () => ({
      totalUsers: state.users.length,
      activeUsers: state.users.filter((u) => u.status === 'active').length,
      blockedUsers: state.users.filter((u) => u.status === 'blocked').length,
      totalProducts: state.products.length,
      inStockProducts: state.products.filter((p) => p.stockStatus === 'in_stock').length,
      outOfStockProducts: state.products.filter((p) => p.stockStatus === 'out_of_stock').length,
      totalOrders: state.orders.length,
      pendingOrders: state.orders.filter((o) => o.orderStatus === 'pending').length,
      deliveredOrders: state.orders.filter((o) => o.orderStatus === 'delivered').length,
      totalRevenue: state.orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0),
      pendingReviews: state.reviews.filter((r) => r.status === 'pending').length,
      unreadNotifications: state.notifications.filter((n) => !n.read).length,
    }),
    [state]
  );

  const value: AdminDataContextType = {
    state,
    refreshData,
    toggleUserStatus,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    updateOrderStatus,
    updatePaymentStatus,
      updateTracking,
    approveReview,
    rejectReview,
    deleteReview,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    addNotification,
    getDashboardStats,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

export default AdminDataContext;
