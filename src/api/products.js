import API from './API';
import { products as fallbackProducts } from '../data/products';
import { normalizeProduct } from '../utils/productUtils';

export async function fetchProducts() {
  try {
    const response = await API.get('/Product/all');

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(normalizeProduct);
  } catch {
    return fallbackProducts.map(normalizeProduct);
  }
}

export async function fetchProductsStrict() {
  const response = await API.get('/Product/all');

  return Array.isArray(response.data)
    ? response.data.map(normalizeProduct)
    : [];
}
