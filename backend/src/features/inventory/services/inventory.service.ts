import { inventoryRepository } from '../repositories/inventory.repository.js';
import { logActivity } from '../../../core/utils/logger.js';
import type { CreateProductData, UpdateProductData } from '../../../core/types/index.js';

export const createProduct = async (data: CreateProductData, userId?: string) => {
  if (!data.name) throw new Error('Product name is required.');

  const product = await inventoryRepository.createProduct(data);

  if (userId) {
    await logActivity(userId, 'CREATE', 'PRODUCT', product.id, `Created product: ${product.name} with initial stock ${product.qtyOnHand}`);
  }

  if (product.qtyOnHand > 0) {
    await inventoryRepository.createStockLedgerEntry(product.id, product.qtyOnHand, 'INITIAL', 'INITIAL_STOCK');
  }

  return product;
};

export const getAllProducts = async () => {
  return await inventoryRepository.findAllProducts();
};

export const getProductById = async (id: string) => {
  const product = await inventoryRepository.findProductById(id);
  if (!product) throw new Error('Product not found.');
  return product;
};

export const updateProduct = async (id: string, data: UpdateProductData, userId?: string) => {
  const product = await inventoryRepository.updateProduct(id, data);

  if (userId) {
    await logActivity(userId, 'UPDATE', 'PRODUCT', id, `Updated product details for ${product.name}`);
  }

  return product;
};

export const deleteProduct = async (id: string, userId?: string) => {
  const linesCount = await inventoryRepository.countSalesOrderLines(id);
  if (linesCount > 0) {
    throw new Error('Cannot delete: This product has historical Sales Orders linked to it.');
  }

  const product = await inventoryRepository.deleteProduct(id);

  if (userId) {
    await logActivity(userId, 'DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`);
  }

  return product;
};

export const adjustStock = async (id: string, adjustment: number, reason: string, userId?: string) => {
  if (!adjustment || isNaN(adjustment)) {
    throw new Error('A valid adjustment quantity is required.');
  }

  const product = await inventoryRepository.adjustStockTransaction(id, adjustment, reason);

  if (userId) {
    await logActivity(userId, 'ADJUST_STOCK', 'PRODUCT', id, `Manually adjusted stock for ${product.name} by ${adjustment}. Reason: ${reason}`);
  }

  return product;
};

export const getStockLedger = async () => {
  return await inventoryRepository.findAllStockLedgerEntries();
};
