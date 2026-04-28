import API from './API';
import { products as fallbackProducts } from '../data/products';
import { normalizeProduct } from '../utils/productUtils';

function mergeProducts(primaryProducts = [], secondaryProducts = []) {
  const seenNames = new Set();
  const mergedProducts = [];

  [...primaryProducts, ...secondaryProducts].forEach((product) => {
    const normalizedProduct = normalizeProduct(product);
    const productKey = normalizedProduct.name.trim().toLowerCase();

    if (!productKey || seenNames.has(productKey)) {
      return;
    }

    seenNames.add(productKey);
    mergedProducts.push(normalizedProduct);
  });

  return mergedProducts;
}

export async function fetchProducts() {
  try {
    const response = await API.get('/Product/all');

    if (!Array.isArray(response.data)) {
      return fallbackProducts.map(normalizeProduct);
    }

    return mergeProducts(response.data, fallbackProducts);
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
