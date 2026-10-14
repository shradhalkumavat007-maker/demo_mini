import { useInventoryStore } from '@/store/inventory-store';

export const reportService = {
  getInventoryReport: () => {
    const { products, categories, suppliers } = useInventoryStore.getState();
    return { products, categories, suppliers };
  },
  getStockInReport: () => {
    const transactions = useInventoryStore.getState().transactions;
    return transactions.filter((t) => t.type === 'stock_in');
  },
  getStockOutReport: () => {
    const transactions = useInventoryStore.getState().transactions;
    return transactions.filter((t) => t.type === 'stock_out');
  },
  getPurchaseReport: () => useInventoryStore.getState().purchaseOrders,
  getSupplierReport: () => useInventoryStore.getState().suppliers,
  getWarrantyReport: () => useInventoryStore.getState().warranties,
  getProfitLossReport: () => {
    const transactions = useInventoryStore.getState().transactions;
    return transactions.filter((t) => t.type === 'stock_out');
  },
  getProductReport: () => useInventoryStore.getState().products,
};
